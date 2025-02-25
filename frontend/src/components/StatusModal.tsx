"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from 'lucide-react'
import { cn } from "@/lib/utils"

interface StatusModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  status: 'success' | 'error'
}

export function StatusModal({ isOpen, onClose, title, description, status }: StatusModalProps) {
  const [open, setOpen] = useState(isOpen)

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-full",
            status === 'success' ? "bg-green-100" : "bg-red-100"
          )}>
            {status === 'success' ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          <DialogTitle className="text-center text-lg font-semibold leading-6 text-gray-900 mt-4">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center mt-2 text-sm text-gray-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-5 sm:mt-6">
          <Button
            className={cn(
              "w-full",
              status === 'success' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            )}
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}