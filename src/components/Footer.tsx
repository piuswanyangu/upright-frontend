export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-gray-200 bg-white py-4 mt-auto">
      <p className="text-center text-sm text-gray-500">
        &copy; {year} Upright Support Platform. All rights reserved.
      </p>
    </footer>
  )
}
