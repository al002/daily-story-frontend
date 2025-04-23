'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 半透明背景，更柔和的效果 */}
      <div className="absolute inset-0 bg-stone-50/80 backdrop-blur-[2px]" />
      
      <div 
        className="
          relative
          bg-white 
          rounded-xl 
          p-6 
          max-w-md 
          w-full 
          max-h-[80vh] 
          overflow-y-auto
          shadow-lg 
          shadow-stone-200/50
          border
          border-stone-100
          animate-modal-enter
        "
        onClick={e => e.stopPropagation()}
      >
        <div className="prose prose-stone max-w-none">
          {children}
        </div>
        <button
          onClick={onClose}
          className="
            mt-4 
            px-4 
            py-2 
            text-stone-600
            hover:text-stone-900
            transition-colors 
            w-full
            text-sm
            border
            border-stone-200
            rounded-lg
            hover:bg-stone-50
          "
        >
          关闭
        </button>
      </div>
    </div>
  );
}
