function SiteLayout(props: React.PropsWithChildren) {
  return <div className={'flex min-h-[100vh] flex-col'}>{props.children}</div>;
}

export default SiteLayout;
