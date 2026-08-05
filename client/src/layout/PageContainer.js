function PageContainer({ children }) {
  return (
    <main className="flex-1 overflow-y-auto bg-[#1E1F2B]">
      {children}
    </main>
  );
}

export default PageContainer;