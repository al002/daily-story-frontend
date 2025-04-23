'use client';

import { useState } from 'react';
import Modal from './Modal';

export default function Disclaimer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="text-center text-sm text-stone-400 mt-12 mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="
            hover:text-stone-600 
            transition-colors 
            px-3 
            py-1.5 
            rounded-full 
            hover:bg-stone-100/50
          "
        >
          免责声明
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <h2 className="text-xl font-medium mb-4 text-stone-800">免责声明</h2>
        <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
          <p>
            本网站提供的所有故事内容均由人工智能自动生成，仅供娱乐目的使用。
          </p>
          <p>
            故事中的任何人物、事件、地点均为虚构，如有雷同纯属巧合。网站内容不代表任何现实观点或立场。
          </p>
          <p>
            我们不对因使用本网站内容而可能产生的任何直接或间接损失承担责任。
          </p>
          <p>
            继续使用本网站则表示您同意接受本免责声明的所有条款。
          </p>
        </div>
      </Modal>
    </>
  );
}
