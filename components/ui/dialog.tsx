import * as React from "react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Content */}
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ children, className = "" }: DialogContentProps) {
  return (
    <div className={`relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 ${className}`}>
      {children}
    </div>
  )
}

export function DialogHeader({ children, className = "" }: DialogHeaderProps) {
  return (
    <div className={`px-6 pt-6 pb-4 ${className}`}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className = "" }: DialogTitleProps) {
  return (
    <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className = "" }: DialogDescriptionProps) {
  return (
    <p className={`mt-2 text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  )
}

export function DialogFooter({ children, className = "" }: DialogFooterProps) {
  return (
    <div className={`px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3 justify-end ${className}`}>
      {children}
    </div>
  )
}
