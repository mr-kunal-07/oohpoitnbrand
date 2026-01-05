import React from 'react'
import SignIn from '../components/SignIn/SignIn'

export const metadata = {
  title: "Brand Login | Manage Your QR OOH Campaigns | Oohpoint",
  description:
    "Access your Oohpoint dashboard to track, manage, and optimize your QR-powered OOH advertising campaigns. Log in to take control of your brand’s reach.",
  canonical: "https://brand.oohpoint.com/sign-in",
};

const page = () => {
  return (
    <div>
        <SignIn/>
    </div>
  )
}

export default page