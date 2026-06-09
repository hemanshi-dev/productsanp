
import { Home } from 'lucide-react'

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-20">
            <div className="relative overflow-hidden bg-[#00FFFF] py-12 text-black px-4 sm:px-6 lg:px-8 md:py-16">
                <div className="absolute inset-0 flex items-center justify-start pointer-events-none select-none">
                    <span className="text-[18vw] font-extrabold text-black/5 leading-none translate-y-4 font-clash-display uppercase tracking-normal pl-4 md:text-[12vw]">
                        PRIVACY
                    </span>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <h1 className="font-clash-display text-4xl font-bold tracking-normal text-black md:text-6xl">
                            Privacy Policy
                        </h1>
                        <p className="mt-3 font-geist-reference text-sm font-semibold text-black/60">
                            Last updated: May 7, 2026
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold font-geist-reference bg-black/5 px-4 py-2 rounded-full backdrop-blur-sm w-fit border border-black/10 text-black/80">
                        <a href="/" className="hover:opacity-70 transition-opacity flex items-center gap-1 text-black">
                            <Home className="w-3.5 h-3.5" /> Home
                        </a>
                        <span className="text-black/60">/</span>
                        <span className="opacity-70 text-black">Privacy Policy</span>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-12 pt-0 md:pb-16">
                <div className="relative mx-auto w-full max-w-[1120px] overflow-hidden rounded-b-[28px] rounded-t-none border border-t-0 border-white/10 bg-[#030405] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.75)] md:p-10 lg:p-12">
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#00FFFF]/35 to-transparent" />

                <div className="relative z-10 space-y-8 font-geist-reference text-sm leading-relaxed text-white/68 md:text-base [&_a]:text-[#00FFFF] [&_a]:transition-colors [&_a:hover]:text-white [&_h2]:font-clash-display [&_h3]:text-white [&_li::marker]:text-[#00FFFF] [&_strong]:text-white">
                    <p>
                        This Privacy Policy describes how ProductSnap AI collects, uses, and protects your information when you use ProductSnap AI and related services. By using ProductSnap AI, you agree to the practices described in this Privacy Policy.
                    </p>
                    <p>
                        Users may access core features of ProductSnap AI without creating an account. Sign in with Apple or Google Sign-In is only required when purchasing or restoring premium subscriptions and related premium features.
                    </p>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">1. Information We Collect</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Account Information</h3>
                                <p>
                                    If you choose to purchase or restore a premium subscription, ProductSnap AI may require authentication using Sign in with Apple or Google Sign-In. When authentication is used, ProductSnap AI may receive limited account information from the authentication provider, including:
                                </p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li>Name</li>
                                    <li>Email address</li>
                                    <li>Profile identifier</li>
                                    <li>Profile photo (if available)</li>
                                </ul>
                                <p className="mt-2">
                                    This information is used solely for premium purchase verification, subscription restoration, account authentication, user support, and account management. ProductSnap AI does not access or store passwords.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold">User Inputs</h3>
                                <p>
                                    You may provide text prompts or upload images for AI-based image generation and editing features. Uploaded images are processed only to provide the requested functionality and are not permanently stored or retained after processing is completed. Text prompts used for AI image generation are processed solely to provide the requested output.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold">AI-Generated Outputs</h3>
                                <p>
                                    AI-generated images and edits are created based on your inputs and are made available directly to you. ProductSnap AI does not publicly share or sell generated outputs.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold">Automatically Collected Data</h3>
                                <p>
                                    ProductSnap AI may automatically collect limited technical and diagnostic information, including device type, operating system, browser type, IP address, app version, crash logs, performance diagnostics, and anonymous analytics events. This information does not directly identify you and is used to improve app stability, security, and performance.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">2. How We Use Information</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Provide AI-based image generation and editing features.</li>
                            <li>Process requests temporarily during active sessions.</li>
                            <li>Improve functionality, performance, and reliability.</li>
                            <li>Monitor crashes and technical issues.</li>
                            <li>Analyze anonymous usage trends.</li>
                            <li>Maintain security and prevent misuse.</li>
                            <li>Process and manage premium subscriptions.</li>
                            <li>Restore premium purchases.</li>
                            <li>Comply with legal obligations.</li>
                        </ul>
                        <p className="mt-2">
                            ProductSnap AI does not sell personal information to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">3. Third-Party Services</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Google Cloud Platform</h3>
                                <p>
                                    Processing and infrastructure services may operate on secure Google Cloud infrastructure with industry-standard security protections.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Analytics &amp; Crash Reporting</h3>
                                <p>
                                    ProductSnap AI may use analytics and crash reporting services to monitor performance, diagnose issues, and improve user experience. These services may collect anonymous technical and usage data.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Apple App Store / Google Play</h3>
                                <p>
                                    Subscription purchases and payments are securely handled by Apple or Google through their respective platforms. ProductSnap AI does not directly store payment card information.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Google Sign-In / Sign in with Apple</h3>
                                <p>
                                    Authentication services may be provided by Google or Apple for premium purchase verification and subscription restoration.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">AI Studio (if applicable)</h3>
                                <p>
                                    AI moderation and filtering systems may be used to help prevent generation of harmful, illegal, explicit, or abusive content.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">4. AI Processing Model</h2>
                        <p>
                            ProductSnap AI uses local on-device AI models for image generation features. Users provide text input to generate specific images requested by the user. Text prompts are processed locally for generation functionality.
                        </p>
                        <p className="mt-2">
                            Third-Party AI Transfer: ProductSnap AI does not send text prompts to third-party AI providers for inference.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">5. Content Moderation</h2>
                        <p>
                            Users are prohibited from uploading, generating, or sharing content that is explicit or pornographic, violent or abusive, hateful or discriminatory, illegal or exploitative, or harmful to minors.
                        </p>
                        <p className="mt-2">
                            Automated moderation and filtering systems may be used to detect and block prohibited content.
                        </p>
                        <p className="mt-2">
                            Repeated or severe violations may result in temporary restrictions, permanent bans, or reporting to relevant authorities where legally required.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">6. Data Retention &amp; Deletion</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Uploaded images are processed temporarily and are not permanently stored after processing is completed.</li>
                            <li>AI-generated outputs are not retained after the active session unless required for temporary processing or legal compliance.</li>
                            <li>Anonymous analytics and crash data may be retained in aggregated form for app improvement and security monitoring.</li>
                            <li>Subscription and transaction records may be retained as required for financial, tax, fraud prevention, or legal obligations.</li>
                            <li>Account-related information used for premium verification may be retained only as necessary to provide subscription services and restore purchases.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">7. Subscriptions</h2>
                        <p>
                            ProductSnap AI offers three optional premium subscription plans that users may purchase.
                        </p>
                        <p className="mt-2">
                            Subscriptions may include benefits such as ad-free experience, access to premium AI features, and enhanced generation limits or capabilities.
                        </p>
                        <p className="mt-2">
                            All subscriptions automatically renew unless canceled at least 24 hours before the end of the current billing period. Users can manage or cancel subscriptions anytime through their Apple App Store or Google Play account settings. Payments and billing are handled securely by Apple or Google.
                        </p>
                        <p className="mt-2">
                            Terms of Use (EULA):  <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/?utm_source=chatgpt.com" target="blank" className="">Apple Standard EULA.</a>
                            
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">8. Data Security</h2>
                        <p>
                            ProductSnap AI uses industry-standard security measures, including encryption and secure cloud infrastructure, to protect information during transmission and processing.
                        </p>
                        <p className="mt-2">
                            While reasonable measures are taken to protect information, no method of electronic storage or transmission is completely secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">9. Children&apos;s Privacy</h2>
                        <p>
                            ProductSnap AI is not intended for children under the age of 13.
                        </p>
                        <p className="mt-2">
                            ProductSnap AI does not knowingly collect personal information from children. If you believe a child has provided information, please contact us so appropriate action can be taken.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">10. Changes to This Privacy Policy</h2>
                        <p>
                            ProductSnap AI may update this Privacy Policy from time to time to reflect changes in features, technologies, legal requirements, or business practices.
                        </p>
                        <p className="mt-2">
                            Updated versions will be posted with a revised “Last updated” date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#00FFFF] mb-4">11. Contact Us</h2>
                        <p>
                            If you have questions or concerns regarding this Privacy Policy or data practices, contact:
                        </p>
                        <p className="mt-2">
                            Email: <a href="mailto:embeepay141@gmail.com" className="text-primary hover:text-black">embeepay141@gmail.com</a>
                        </p>
                    </section>
                </div>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy
