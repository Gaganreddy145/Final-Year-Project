import { Outlet } from "react-router-dom";

import React from 'react'

function RootLayout() {
  return (
    <div>
        <Outlet />
    </div>
  )
}

export default RootLayout