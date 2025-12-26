import { Skill } from '../../types';

interface SkillTreeProps {
  skills: Skill[];
}

export default function SkillTree({ skills }: SkillTreeProps) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">⚡</span>
        <h2 className="text-lg font-bold text-white">スキルツリー</h2>
      </div>

      {/* スキルグリッド */}
      <div className="grid grid-cols-3 gap-6">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className={`relative ${!skill.isUnlocked ? 'opacity-50' : ''}`}
          >
            {/* スキルアイコン */}
            <div
              className={`relative w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                skill.isUnlocked
                  ? 'bg-gradient-to-br from-green-400 to-green-600'
                  : 'bg-gray-600'
              } ${!skill.isUnlocked && 'cursor-not-allowed'}`}
            >
              {/* アイコン */}
              <div className="text-3xl">
                {skill.name === 'HTML/CSS' && '🌐'}
                {skill.name === 'JavaScript' && '⚡'}
                {skill.name === 'React' && '⚛️'}
                {skill.name === 'Node.js' && '📦'}
                {skill.name === 'Next.js' && '▲'}
              </div>

              {/* ロックアイコン */}
              {!skill.isUnlocked && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
              )}

              {/* 進捗リング */}
              {skill.isUnlocked && skill.progress > 0 && (
                <svg
                  className="absolute inset-0 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray={`${skill.progress * 3.02} 302`}
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* 完了チェック */}
              {skill.progress === 100 && (
                <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
              )}
            </div>

            {/* スキル名 */}
            <p className="text-center text-white font-medium mt-3 text-sm">
              {skill.name}
            </p>

            {/* 進捗率 */}
            {skill.isUnlocked && (
              <p className="text-center text-green-300 text-xs mt-1">
                {skill.progress}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
