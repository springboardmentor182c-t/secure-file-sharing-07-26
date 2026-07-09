function PageContainer({ children }) {

  return (

    <main
      className="
        flex-1
        overflow-y-auto
        bg-[#1E1F2B]
        p-8
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
        "
      >

        {children}

      </div>


    </main>

  );

}


export default PageContainer;