const ShippingPolicy = () => {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">
                    Shipping Policy
                </h1>

                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <p>
                        This Shipping Policy outlines the terms and conditions for the delivery of digital products and services provided by ProductSnap AI. Please read this policy carefully before using our services.
                    </p>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Digital Products & Services</h2>
                        <p>
                            ProductSnap AI provides digital products and AI-powered image generation services. As these are digital services, there is no physical shipping involved. All generated content is delivered instantly through our platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Delivery Method</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong className="text-primary">Instant Delivery:</strong> All AI generated images and videos are delivered immediately upon completion through our web platform.
                            </li>
                            <li>
                                <strong className="text-primary">Download Access:</strong> Users can download their generated content directly from the platform at any time.
                            </li>
                            <li>
                                <strong className="text-primary">Cloud Storage:</strong> Generated content is stored securely in the cloud and accessible through your account.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Processing Time</h2>
                        <div className="space-y-3">
                            <p>
                                <strong className="text-primary">Image Generation:</strong> Typically completed within 1-5 minutes, depending on the complexity and number of images requested.
                            </p>
                            <p>
                                <strong className="text-primary">Video Generation:</strong> May take 5-15 minutes depending on the length and complexity of the video.
                            </p>
                            <p>
                                <strong className="text-primary">High Volume Requests:</strong> During peak times, processing may take longer. You will be notified of any delays.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Access & Availability</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>All generated content is accessible through your account dashboard</li>
                            <li>Content remains available for download as long as your account is active</li>
                            <li>We recommend downloading and backing up your generated content regularly</li>
                            <li>Content may be subject to our data retention policies</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Technical Requirements</h2>
                        <p>To access and download your generated content, you need:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>A stable internet connection</li>
                            <li>A compatible web browser (Chrome, Firefox, Safari, or Edge)</li>
                            <li>Sufficient storage space on your device for downloads</li>
                            <li>An active account with ProductSnap AI</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Support</h2>
                        <p>
                            If you experience any issues accessing or downloading your generated content, please contact our support team at{" "}
                            <a href="mailto:embeepay141@gmail.com" className="text-primary hover:text-black">
                                embeepay141@gmail.com
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Updates to This Policy</h2>
                        <p>
                            We may update this Shipping Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default ShippingPolicy

