import {
    ColumnDef,
  } from "@tanstack/react-table"
import { ShopifyProduct } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";




export const columns: ColumnDef<ShopifyProduct>[] = [
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={row.original.featuredImage?.url} />
              <AvatarFallback>PD</AvatarFallback>
            </Avatar>
            <span className="font-medium">{row.original.title}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <Badge variant={
            row.original.status === 'ACTIVE' ? "outline":
            row.original.status === 'DRAFT' ? "secondary" : "destructive"
          }>
            {row.original.status.toLowerCase()}
          </Badge>
        )
      },
    },
    {
      accessorKey: "totalInventory",
      header: "Inventory",
      cell: ({ row }) => row.original.totalInventory,
    },
    {
      accessorKey: "publishedOnChannel",
      header: "Sales Channels",
      cell: ({ row }) => (
        <Badge variant={row.original.publishedAt ? "outline" : "secondary"}>
          {row.original.publishedAt ? "Published" : "Not Published"}
        </Badge>
      ),
    },
    {
      accessorKey: "collections",
      header: "Category",
      cell: ({ row }) => {
        const categories = row.original.collections.edges.map(edge => edge.node.title).join(", ")
        return categories || "No category"
      },
    },
    {
      accessorKey: "productType",
      header: "Type",
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
                Copy product ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit product</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete product</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]