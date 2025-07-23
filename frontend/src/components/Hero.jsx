function Hero(){
    return(
        <section className="text-center py-20 px-6">
            <h2 className="text-5xl font-bold text-grey-900 mb-4">
                Find Your Dream Job with <span className="text-blue-600">HireBot</span>
            </h2>
            <p className="text-lg text-grey-600 max-w-lx mx-auto mb-6">
                 AI-powered job search assistant that recommends the best opportunities
        based on your skills and experience. 
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition">
                Get Started
            </button>
        </section>
    )
}

export default Hero;