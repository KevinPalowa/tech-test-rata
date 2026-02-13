import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'

export const Modal = ({
    isOpen,
    onClose,
    title,
    message,
    confirmLabel = 'Konfirmasi',
    cancelLabel = 'Batal',
    onConfirm,
    variant = 'danger'
}) => {
    if (typeof isOpen === 'undefined') return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content Container */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'
                                        }`}>
                                        <AlertCircle size={24} />
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="mt-5">
                                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                        {message}
                                    </p>
                                </div>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        onClick={onClose}
                                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                                    >
                                        {cancelLabel}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        className={`inline-flex items-center justify-center rounded-full px-8 py-2.5 text-sm font-bold text-white shadow-lg transition ${variant === 'danger'
                                            ? 'bg-red-600 hover:bg-red-500 shadow-red-100'
                                            : 'bg-brand-600 hover:bg-brand-500 shadow-brand-100'
                                            }`}
                                    >
                                        {confirmLabel}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}
