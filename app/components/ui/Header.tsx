import style from "./Header.module.css"

export default function Header({
  title,
  subtitle = ""
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className={style.header}>
      <h1 className={style.title}>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
    </header>
  );
}