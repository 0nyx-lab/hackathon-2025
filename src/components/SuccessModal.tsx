'use client'

interface SuccessModalProps {
  onClose: () => void
  badges: string[]
}

export function SuccessModal({ onClose, badges }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center animate-bounce">
        {/* 成功アイコン */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* 成功メッセージ */}
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          おめでとうございます！
        </h2>
        <p className="text-gray-600 mb-4">
          今日の1分を完了しました
        </p>

        {/* 獲得バッジ */}
        {badges.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">獲得バッジ</h3>
            <div className="flex justify-center space-x-2">
              {badges.map((badge, index) => (
                <div key={index} className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 継続メッセージ */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            継続は力なり！明日も頑張りましょう 🚀
          </p>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          続ける
        </button>
      </div>
    </div>
  )
}
