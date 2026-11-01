function SiteLayout(props: React.PropsWithChildren) {
  return <div className={'flex w-full flex-1 flex-col'}>{props.children}</div>;
}

export default SiteLayout;
