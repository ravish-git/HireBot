function Features(){
    return(
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-10 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2">AI Job Recommendations</h3>
                <p className="text-grey-600">
                    Get personalized jobsuggestions using out AI algoritm.
                </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2">Resume Analysis</h3>
                <p className="text-gray-600">
                    upload your resume and receive instant feedback and optimization tips.
                </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2">Application Tracking</h3>
                <p className="text-gray-600">
                    Keep track of your job applications in one dashboard.
                </p>
            </div>
        </section>
    )
}

export default Features;