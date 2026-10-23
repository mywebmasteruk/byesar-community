export function EmptyNote({
  title,
  body,
  testId,
}: {
  title: string;
  body: string;
  testId: string;
}) {
  return (
    <div
      className="border-border bg-card rounded-lg border border-dashed px-4 py-10 text-center"
      data-test={testId}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">{body}</p>
    </div>
  );
}
