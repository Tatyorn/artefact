"use client";

type AlertProps = {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
};

export function Alert({ type, message, onClose }: AlertProps) {
  return (
    <div
      className={`alert alert-${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <span>{message}</span>
      {onClose ? (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Fechar mensagem"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
