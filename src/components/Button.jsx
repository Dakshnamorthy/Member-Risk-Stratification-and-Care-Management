import '../styles/pages.css';

export default function Button({ children, variant = 'primary', onClick, type = 'button', className = '', ...props }) {
  return (
    <button className={`button button--${variant} ${className}`.trim()} type={type} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
