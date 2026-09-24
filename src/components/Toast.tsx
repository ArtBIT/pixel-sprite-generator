export const Toast = ({ message }: { message: string | null }) => (
  <div className="toast" role="status" aria-live="polite" data-visible={!!message}>
    {message}
  </div>
);
