const CancellationsAndRefunds = () => {
    return (
        <div className="min-h-screen  pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">
                    Cancellations and Refunds
                </h1>

                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <p>
                        This Cancellations and Refunds Policy outlines the terms and conditions for canceling services and requesting refunds from ProductSnap AI. Please read this policy carefully before making a purchase.
                    </p>

                    <section>
                           <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Digital Services</h2>
                        <p>
                            ProductSnap AI provides digital AI-powered image and video generation services. As these are digital services delivered instantly, standard refund policies apply as outlined below.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Credit Purchases</h2>
                        <div className="space-y-3">
                            <p>
                                <strong className="text-primary">Non-Refundable Credits:</strong> Credits purchased are generally non-refundable once the transaction is completed. Credits are consumed when you generate images or videos.
                            </p>
                            <p>
                                <strong className="text-primary">Unused Credits:</strong> Unused credits remain in your account and do not expire unless otherwise specified at the time of purchase.
                            </p>
                            <p>
                                <strong className="text-primary">Refund Exceptions:</strong> Refunds for credit purchases may be considered on a case-by-case basis for technical issues or service unavailability.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Service Cancellation</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>You may stop using our services at any time</li>
                            <li>No cancellation fee applies for discontinuing service usage</li>
                            <li>Unused credits remain in your account for future use</li>
                            <li>Account deletion requests can be made through our support team</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Refund Eligibility</h2>
                        <p>Refunds may be considered in the following circumstances:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>
                                <strong className="text-primary">Technical Failures:</strong> If the service fails to deliver due to technical issues on our end
                            </li>
                            <li>
                                <strong className="text-primary">Service Unavailability:</strong> If the service is unavailable for extended periods (more than 24 hours)
                            </li>
                            <li>
                                <strong className="text-primary">Duplicate Charges:</strong> If you are charged multiple times for the same transaction
                            </li>
                            <li>
                                <strong className="text-primary">Unauthorized Transactions:</strong> If your account is used without your authorization
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Refund Process</h2>
                        <div className="space-y-3">
                            <p>
                                <strong className="text-primary">Step 1:</strong> Contact our support team at{" "}
                                <a href="mailto:support@shuchiai.com" className="text-primary hover:text-black">
                                    support@shuchiai.com
                                </a>{" "}
                                with your refund request
                            </p>
                            <p>
                                <strong className="text-primary">Step 2:</strong> Provide your transaction details, including order ID, date of purchase, and reason for refund
                            </p>
                            <p>
                                <strong className="text-primary">Step 3:</strong> Our team will review your request within 5-7 business days
                            </p>
                            <p>
                                <strong className="text-primary">Step 4:</strong> If approved, refunds will be processed to the original payment method within 10-15 business days
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Non-Refundable Items</h2>
                        <p>The following are generally non-refundable:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Credits that have been used to generate content</li>
                            <li>Services that have been successfully delivered</li>
                            <li>Purchases made more than 30 days ago</li>
                            <li>Refunds requested due to user error (wrong input, incorrect settings, etc.)</li>
                            <li>Content that does not meet personal expectations (subjective quality issues)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Processing Time</h2>
                        <p>
                            Refund requests are typically processed within 5-7 business days. Once approved, refunds may take an additional 10-15 business days to appear in your account, depending on your payment method and financial institution.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Dispute Resolution</h2>
                        <p>
                            If you are not satisfied with our refund decision, you may contact us to discuss your case further. We are committed to fair resolution of all disputes and will work with you to find a satisfactory solution.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Contact Us</h2>
                        <p>
                            For refund requests or questions about this policy, please contact us at{" "}
                            <a href="mailto:support@shuchiai.com" className="text-primary hover:text-black">
                                support@shuchiai.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default CancellationsAndRefunds

