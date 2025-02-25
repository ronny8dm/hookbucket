import { Button } from "@/components/ui/button";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import  { useState } from "react";
import { columns } from "./Columns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusModal } from "@/components/StatusModal";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductModal } from "./ProductModal";

export default function InventoryTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    description: "",
    status: "success" as "success" | "error",
  });
  const { products, deleteProduct } =
    useShopifyProducts();

    const table = useReactTable({
        data: products,
        columns: [
          {
            id: "select",
            header: ({ table }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          },
          ...columns,
        ],
        enableRowSelection: true, 
        onRowSelectionChange: setRowSelection, 
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
          sorting,
          columnFilters,
          columnVisibility,
          rowSelection, 
        },
      });

      const handleDelete = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length === 0) {
          setModalState({
            isOpen: true,
            title: "Error",
            description: "Please select products to delete.",
            status: "error",
          });
          return;
        }
      
        try {
          await Promise.all(selectedRows.map(row => deleteProduct(row.original.id)));
          setModalState({
            isOpen: true,
            title: "Products Deleted",
            description: `Successfully deleted ${selectedRows.length} product(s).`,
            status: "success",
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
          setModalState({
            isOpen: true,
            title: "Error",
            description: "Failed to delete products: " + errorMessage,
            status: "error",
          });
        }
      };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Manage Products
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => setIsProductModalOpen(true)}>
              Add Product
            </DropdownMenuItem>
            <DropdownMenuItem>
              Update Product
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleDelete}
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem >
              Delete All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredRowModel().rows.length} products(s)
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <StatusModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        description={modalState.description}
        status={modalState.status}
      />

<ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </div>
  );
}
