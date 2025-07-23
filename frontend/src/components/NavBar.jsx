function NavBar(){
    return(
        <nav className="flex justify-between items-center p-5 bg-white shadow">
            <h1 className="text-2xl font-bold text-blue-600">HireBot</h1>
            <ul>
                <li className="hover:text-blue-600 cursor-pointer">Home</li>
                <li className="hover:text-blue-600 cursor-pointer">Jobs</li>
                <li className="hover:text-blue-600 cursor-pointer">About</li>
                <li className="hover:text-blue-600 cursor-pointer">Contact</li>
            </ul>
        </nav>
    )
}

export default NavBar;