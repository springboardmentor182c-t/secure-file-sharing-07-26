import "./PageHeader.css";

export default function PageHeader({
  title,
  subtitle,
  buttonText,
  buttonIcon,
  onButtonClick,
}) {
  return (
    <div className="page-header">

      <div className="page-header-left">

        <h1>{title}</h1>

        <p>{subtitle}</p>

      </div>

      {buttonText && (
        <button
          className="page-header-btn"
          onClick={onButtonClick}
        >
          {buttonIcon}

          {buttonText}
        </button>
      )}

    </div>
  );
}