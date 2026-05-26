import Image from "next/image";
import Link from "next/link";
import AmazonLogo from "@/public/shopon/amazon.jpeg";
import FlipkartLogo from "@/public/shopon/flipkart.jpeg";
import MyntraLogo from "@/public/shopon/myntra.jpeg";

const ShopOn = () => {
  return (
    <main className="w-full px-8 py-10">
      <h1 className="text-4xl font-bold mb-6">Shop On</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <Link
          href="https://www.amazon.in/s?rh=n%3A1571271031%2Cp_4%3ABAMBUMM&ref=bl_sl_s_ap_web_1571271031"
          className="flex items-center justify-center bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={AmazonLogo.src}
            alt="Amazon"
            width={220}
            height={100}
            className="object-contain w-full h-20"
          />
        </Link>
        <Link
          href="https://www.flipkart.com/clothing-and-accessories/bambumm~brand/pr?sid=clo&p[]=facets.brand%255B%255D%3Dbambumm&otracker=categorytree"
          className="flex items-center justify-center bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={FlipkartLogo.src}
            alt="Flipkart"
            width={220}
            height={100}
            className="object-contain w-full h-20"
          />
        </Link>
        <Link
          href="https://www.myntra.com/bambumm?rawQuery=bambumm"
          className="flex items-center justify-center bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={MyntraLogo.src}
            alt="Myntra"
            width={220}
            height={100}
            className="object-contain w-full h-20"
          />
        </Link>
      </div>
    </main>
  );
};

export default ShopOn;
