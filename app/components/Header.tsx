export default function Header({
  title,
  subtitle = ""
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="header">
      <h1>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
    </header>
  );
}