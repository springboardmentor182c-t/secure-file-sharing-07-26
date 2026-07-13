import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import PageContainer from "./PageContainer";


function MainLayout() {

  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (

    <div className="flex h-screen overflow-hidden bg-[#1E1F2B]">


      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />


      <div className="flex flex-1 flex-col overflow-hidden">


        <Header
          setSidebarOpen={setSidebarOpen}
        />


        <PageContainer>

          <Outlet />

        </PageContainer>


      </div>


    </div>

  );
}


export default MainLayout;