import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import AWS from "aws-sdk";
import cors from "cors";
import multer from "multer";
import { GraphQLClient } from "graphql-request";
import { requireAuth } from "../middleware/authMiddleware.js";
import { ExpressAuth } from "@auth/express";
import { Resend } from "resend";
import { MongoClient } from "mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import cookieParser from "cookie-parser";
import crypto from "crypto";

dotenv.config();

// --- Setup dependencies and configuration ---
const upload = multer();
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const processedPayloads = new Set();
const mongoClient = new MongoClient(process.env.MONGODB_URI);
const clientPromise = mongoClient.connect();
const resend = new Resend(process.env.RESEND_API_KEY);

const emailProvider = {
  id: "email",
  name: "Email",
  type: "email",
  sendVerificationRequest: async ({ identifier, url }) => {
    try {
      // Transform URL to use frontend URL
      const transformedUrl = url.replace(
        process.env.AUTH_URL,
        process.env.FRONTEND_URL
      );
      console.log("Sending verification email to:", identifier);
      console.log("Magic link URL:", transformedUrl);

      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: identifier,
        subject: "Sign in to HookBucket",
        html: `
          <h1>Sign in to HookBucket</h1>
          <p>Click the link below to sign in:</p>
          <a href="${transformedUrl}">${transformedUrl}</a>
        `,
      });

      console.log("Email sent successfully");
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }
  },
};

export const authConfig = {
  providers: [emailProvider],
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET,
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });
      const frontendUrl = process.env.FRONTEND_URL;
      if (url.startsWith(frontendUrl)) return url;
      return url.replace(process.env.AUTH_URL, frontendUrl);
    },
    async signIn({ user, email }) {
      console.log("SignIn Callback:", { user, email });
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: `${process.env.FRONTEND_URL}/signin`,
    verifyRequest: `${process.env.FRONTEND_URL}/verify-request`,
    error: `${process.env.FRONTEND_URL}/error`,
  },
  urls: {
    baseUrl: process.env.AUTH_URL,
    origin: process.env.AUTH_URL,
    callback: `${process.env.AUTH_URL}/auth/callback`,
  },
};

console.log("authConfig", authConfig);

// --- Create Express App ---
const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "csrf-token", "cookie"],
      exposedHeaders: ["csrf-token", "set-cookie"],
      optionsSuccessStatus: 200,
    })
  );

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.post("/api/shopify/products", requireAuth, async (req, res) => {
    try {
      const client = new GraphQLClient(
        `https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-01/graphql.json`,
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      const { query, variables } = req.body;
      const data = await client.request(query, variables);

      res.json(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        error: "Error fetching products",
        message: error.message,
      });
    }
  });

  app.post(
    "/api/shopify/products/create",
    requireAuth,
    upload.array("images"),
    async (req, res) => {
      try {
        const client = new GraphQLClient(
          `https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-01/graphql.json`,
          {
            headers: {
              "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
              "Content-Type": "application/json",
            },
          }
        );

        const productData = JSON.parse(req.body.productData);

        const productResponse = await client.request(
          productData.query,
          productData.variables
        );

        if (req.body.mediaData && req.files?.length > 0) {
          const mediaData = JSON.parse(req.body.mediaData);
          const productId = productResponse.productCreate.product.id;
          const mediaInput = req.files.map((file) => ({
            mediaContentType: "IMAGE",
            originalSource: `data:${
              file.mimetype
            };base64,${file.buffer.toString("base64")}`,
            alt: productData.variables.input.title,
          }));

          mediaData.variables = { productId, media: mediaInput };

          const mediaResponse = await client.request(
            mediaData.query,
            mediaData.variables
          );

          productResponse.media = mediaResponse.productCreateMedia.media;
        }

        res.json(productResponse);
      } catch (error) {
        console.error("Error details:", error.response?.errors);
        res.status(500).json({
          error: "Error creating product",
          message: error.message,
          details: error.response?.errors,
        });
      }
    }
  );

  app.post("/api/shopify/products/delete", requireAuth, async (req, res) => {
    try {
      const client = new GraphQLClient(
        `https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-01/graphql.json`,
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      const { productId } = req.body;
      const { query, variables } = req.body;
      const data = await client.request(query, variables);
      res.json(data);
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        error: "Error deleting product",
        message: error.message,
      });
    }
  });

  app.post("/api/shopify/products/update", requireAuth, async (req, res) => {
    try {
      const client = new GraphQLClient(
        `https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-01/graphql.json`,
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      const { query, variables } = req.body;
      const data = await client.request(query, variables);
      res.json(data);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        error: "Error updating product",
        message: error.message,
      });
    }
  });

  app.post("/webhook/shopify", requireAuth, async (req, res) => {
    const payload = req.body;
    const payloadId = payload.id;
    const isUpdate = payload.created_at !== payload.updated_at;
    const uniqueKey = isUpdate
      ? `${payloadId}-${payload.updated_at}`
      : payloadId;

    if (processedPayloads.has(uniqueKey)) {
      return res.status(200).send("Duplicate payload");
    }

    processedPayloads.add(uniqueKey);

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `webhook-${Date.now()}-${uniqueKey}.json`,
      Body: JSON.stringify(payload, null, 2),
      ContentType: "application/json",
    };

    try {
      await s3.upload(params).promise();
      res.status(200).send("Webhook received and processed.");
    } catch (error) {
      console.error("Error uploading to S3:", error);
      res.status(500).send("Error processing webhook.");
    }
  });

  app.get("/api/webhook", requireAuth, async (req, res) => {
    try {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        MaxKeys: 100,
      };

      const data = await s3.listObjects(params).promise();

      const webhookData = await Promise.all(
        data.Contents.map(async (file) => {
          const fileData = await s3
            .getObject({
              Bucket: process.env.S3_BUCKET_NAME,
              Key: file.Key,
            })
            .promise();
          return JSON.parse(fileData.Body.toString());
        })
      );

      const paidOrders = webhookData
        .filter(
          (event) =>
            event.order_status_url &&
            event.financial_status === "paid" &&
            event.cart_token
        )
        .map((order) => ({
          id: order.id,
          cart_token: order.cart_token,
          financial_status: order.financial_status,
          created_at: order.created_at,
          total_value: parseFloat(order.total_price || "0"),
          items: order.line_items || [],
        }));

      const paidCartTokens = new Set(
        paidOrders.map((order) => order.cart_token)
      );

      const processedData = webhookData
        .filter((event) => {
          if (event.order_status_url) return false;

          const cartToken = event.token || event.id;
          const isActive = !paidCartTokens.has(cartToken);

          return isActive;
        })
        .map((event) => {
          const timestamp = new Date(
            event.created_at || event.timestamp
          ).toISOString();
          const totalItems = event.line_items?.length || 0;
          const totalValue =
            event.line_items?.reduce((sum, item) => {
              const linePrice = parseFloat(item.line_price || "0");
              return sum + linePrice;
            }, 0) || 0;

          return {
            id: event.id,
            token: event.token || event.id,
            timestamp,
            totalItems,
            totalValue,
            eventType:
              event.created_at === event.updated_at
                ? "cart_creation"
                : "cart_update",
            items:
              event.line_items?.map((item) => ({
                id: item.id,
                title: item.title,
                price: parseFloat(item.line_price || "0"),
                quantity: item.quantity,
              })) || [],
          };
        });

      const eventsByType = processedData.reduce((acc, event) => {
        if (!acc[event.eventType]) acc[event.eventType] = [];
        acc[event.eventType].push(event);
        return acc;
      }, {});

      const response = {
        raw: processedData,
        metrics: {
          totalEvents: processedData.length,
          eventTypes: Object.keys(eventsByType).map((type) => ({
            type,
            count: eventsByType[type].length,
          })),
          timeSeriesData: processedData.map((event) => ({
            timestamp: event.timestamp,
            type: event.eventType,
            value: event.totalValue,
          })),
          totals: {
            value: processedData.reduce(
              (sum, event) => sum + (event.totalValue || 0),
              0
            ),
            items: processedData.reduce(
              (sum, event) => sum + event.totalItems,
              0
            ),
          },
        },
        eventsByType,
        paidOrders: {
          count: paidOrders.length,
          cartTokens: Array.from(paidCartTokens),
          orders: paidOrders,
          totalValue: paidOrders.reduce(
            (sum, order) => sum + order.total_value,
            0
          ),
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error processing webhook data:", error);
      res.status(500).json({
        error: "Error processing data",
        message: error.message,
      });
    }
  });


  app.get("/auth/csrf", (req, res) => {
    let token = req.cookies?.csrfToken;
    if (!token) {
      token = crypto.randomBytes(32).toString("hex");
      res.cookie("csrfToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }
    res.status(200).json({ csrfToken: token });
  });

  app.get("/", (req, res) => {
    res.send("HookBucket API Server is running!");
  });

  app.set("trust proxy", true);
  app.use("/auth", ExpressAuth(authConfig));
  app.use("/auth", (req, res, next) => {
    console.log("Auth Route Request:", {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: req.headers,
    });
    next();
  });
  app.get("/api", (req, res) => res.send("Express on Vercel"));

  return app;
};

// For local development (if not on production), start the server
if (process.env.NODE_ENV !== "production") {
  const localApp = createApp();
  const PORT = process.env.PORT || 3000;
  localApp.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the app for Vercel
const app = createApp();
export default app;
