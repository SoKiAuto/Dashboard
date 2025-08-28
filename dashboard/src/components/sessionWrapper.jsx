"use client";
// This file is a wrapper for the NextAuth SessionProvider to be used in the app directory

import { SessionProvider } from "next-auth/react";

import React from 'react'

const sessionwrapper = ({childern}) => {
  return (
    <SessionProvider>
      {childern}
    </SessionProvider>
  )
}

export default sessionwrapper