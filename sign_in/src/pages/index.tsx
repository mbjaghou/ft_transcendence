import Image from 'next/image'
import { Inter } from 'next/font/google'
import Sign_in from './Sign_in'


const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
	<Sign_in/>
  )
}
