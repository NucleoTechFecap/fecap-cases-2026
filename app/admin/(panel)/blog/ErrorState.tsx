export function BlogErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="adm-error-page">
      <h1>{title}</h1>
      <p>{message}</p>
      <p>
        <a className="adm-btn" href="/admin/blog">
          ← Voltar para o Blog
        </a>
      </p>
    </div>
  );
}
