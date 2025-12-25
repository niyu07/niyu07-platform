/**
 * ボタンコンポーネント
 *
 * 初心者向けのサンプルコンポーネントです。
 * このボタンは Storybook で確認できます。
 */

interface ButtonProps {
  /** ボタンに表示するテキスト */
  label: string;
  /** クリックしたときの処理 */
  onClick?: () => void;
  /** ボタンの種類 */
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  const baseStyles =
    'px-6 py-3 rounded-lg font-medium transition-colors duration-200';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {label}
    </button>
  );
}
