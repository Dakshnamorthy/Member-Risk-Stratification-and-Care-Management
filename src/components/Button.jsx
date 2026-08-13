import '../styles/pages.css';

export default function Button({ children, variant = 'primary', onClick, type = 'button', ...props }) {
  return (
    <button className={`button button--${variant}`} type={type} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
