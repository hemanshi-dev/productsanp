const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-20">
            <div className="relative overflow-hidden bg-[#00FFFF] py-12 text-black px-4 sm:px-6 lg:px-8 md:py-16">
                <div className="absolute inset-0 flex items-center justify-start pointer-events-none select-none">
                    <span className="text-[18vw] font-extrabold text-black/5 leading-none translate-y-4 font-clash-display uppercase tracking-normal pl-4 md:text-[12vw]">
                        TERMS
                    </span>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <h1 className="font-clash-display text-4xl font-bold tracking-normal text-black md:text-6xl">
                            Terms and Conditions
                        </h1>
                        <p className="mt-3 font-geist-reference text-sm font-semibold text-black/60">
                            Last updated: May 7, 2026
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold font-geist-reference bg-black/5 px-4 py-2 rounded-full backdrop-blur-sm w-fit border border-black/10 text-black/80">
                        <a href="/" className="hover:opacity-70 transition-opacity flex items-center gap-1 text-black">
                            Home
                        </a>
                        <span className="text-black/60">/</span>
                        <span className="opacity-70 text-black">Terms & Conditions</span>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-12 pt-0 md:pb-16">
                <div className="relative mx-auto w-full max-w-[1120px] overflow-hidden rounded-b-[28px] rounded-t-none border border-t-0 border-white/10 bg-[#030405] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.75)] md:p-10 lg:p-12">
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#00FFFF]/35 to-transparent" />

                    <div className="relative z-10 space-y-8 font-geist-reference text-sm leading-relaxed text-white/68 md:text-base [&_a]:text-[#00FFFF] [&_a]:transition-colors [&_a:hover]:text-white [&_h2]:font-clash-display [&_h3]:text-white [&_li::marker]:text-[#00FFFF] [&_strong]:text-white">
                        <p>
                            These Terms and Conditions ("Terms") govern your access to and use of ProductSnap AI's website and services. By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our services.
                        </p>

                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using ProductSnap AI, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">2. Use License</h2>
                            <p>Permission is granted to temporarily use ProductSnap AI for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Modify or copy the materials</li>
                                <li>Use the materials for any commercial purpose or for any public display</li>
                                <li>Attempt to reverse engineer any software contained on the website</li>
                                <li>Remove any copyright or other proprietary notations from the materials</li>
                                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">3. User Accounts</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                                <li>You agree to accept responsibility for all activities that occur under your account</li>
                                <li>You must notify us immediately of any unauthorized use of your account</li>
                                <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">4. Acceptable Use</h2>
                            <p>You agree not to use the service to:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Generate content that is illegal, harmful, threatening, abusive, or violates any laws</li>
                                <li>Create content that infringes on intellectual property rights</li>
                                <li>Generate explicit, violent, or hateful content</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Interfere with or disrupt the service or servers</li>
                                <li>Use automated systems to access the service without permission</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">5. Intellectual Property</h2>
                            <p>
                                The service and its original content, features, and functionality are owned by ProductSnap AI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. Generated content may be subject to separate licensing terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">6. Credits and Payments</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Credits are non-refundable and non-transferable</li>
                                <li>Credits expire according to the terms specified at the time of purchase</li>
                                <li>All prices are subject to change without notice</li>
                                <li>Refunds are handled on a case-by-case basis</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">7. Refunds &amp; Cancellations</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Payments made in the app are generally <strong>non-refundable</strong> once completed.</li>
                                <li>However, refunds may be provided in cases such as failed transactions, duplicate payments, or if the service was not delivered.</li>
                                <li>If a refund is approved, the amount will be returned to the <strong>original payment method</strong> within <strong>5–7 working days</strong>.</li>
                                <li>For any questions related to refunds or cancellations, please reach out through the <strong>Contact Us</strong> section in the app.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">8. Disclaimer</h2>
                            <p>
                                The materials on ProductSnap AI are provided on an 'as is' basis. ProductSnap AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">9. Limitations</h2>
                            <p>
                                In no event shall ProductSnap AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ProductSnap AI's website, even if ProductSnap AI or an authorized representative has been notified orally or in writing of the possibility of such damage.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">10. Revisions</h2>
                            <p>
                                ProductSnap AI may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">11. Contact Information</h2>
                            <p>
                                If you have any questions about these Terms and Conditions, please contact us at <a href="mailto:support@shuchiai.com" className="text-[#00FFFF] hover:text-white">support@shuchiai.com</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TermsAndConditions

