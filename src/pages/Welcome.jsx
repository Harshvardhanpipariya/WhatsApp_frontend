import {
    ArrowRight,
    Lock,
    MessageCircle,
    Shield,
    Sparkles,
    Users,
    Video,
    Globe,
    Zap,
    Star,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import {
    motion,
    useScroll,
    useTransform,
} from 'framer-motion';

const fadeUp = {
    hidden: {
        opacity: 0,
        y: 80,
    },

    visible: {
        opacity: 1,
        y: 0,

        transition: {
            duration: 0.8,
        },
    },
};

const slideLeft = {
    hidden: {
        opacity: 0,
        x: -120,
    },

    visible: {
        opacity: 1,
        x: 0,

        transition: {
            duration: 0.9,
        },
    },
};

const slideRight = {
    hidden: {
        opacity: 0,
        x: 120,
    },

    visible: {
        opacity: 1,
        x: 0,

        transition: {
            duration: 0.9,
        },
    },
};

const Welcome = () => {

    const { scrollY } = useScroll();

    const y1 = useTransform(
        scrollY,
        [0, 1000],
        [0, 300]
    );

    const y2 = useTransform(
        scrollY,
        [0, 1000],
        [0, -300]
    );

    return (

        <div className="bg-[#071018] text-white overflow-x-hidden">

            <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">

                {/* Background */}

                <div className="absolute inset-0 bg-gradient-to-br from-[#071018] via-[#102733] to-[#1f4b57]" />

                {/* Animated Glow */}

                <motion.div
                    style={{ y: y1 }}
                    className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-3xl"
                />

                <motion.div
                    style={{ y: y2 }}
                    className="absolute bottom-[-120px] right-[-120px] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl"
                />

                {/* Navbar */}

                <nav className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-4 sm:px-10 py-5">

                    <div className="flex items-center gap-3">

                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                            <MessageCircle className="text-green-400 w-6 h-6" />
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black tracking-wide">
                            ChatSphere
                        </h1>

                    </div>

                    <div className="flex items-center gap-3">

                        <Link
                            to="/login"
                            className="px-4 sm:px-6 py-2 sm:py-3 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                        >
                            Login
                        </Link>

                        <Link
                            to="/signup"
                            className="px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-green-500 hover:bg-green-600 transition shadow-2xl"
                        >
                            Start
                        </Link>

                    </div>

                </nav>

                {/* Hero Content */}

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 text-center pt-28 sm:pt-20"
                >

                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl mb-8 shadow-lg">

                        <Sparkles className="w-4 h-4 text-green-400" />

                        <span className="text-gray-200 text-xs sm:text-sm tracking-wide">
                            The Future of Messaging
                        </span>

                    </div>

                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-tight tracking-tight">

                        The Most

                        <span className="text-green-400">
                            {' '}Beautiful
                        </span>

                        <br />

                        Way To

                        <span className="text-cyan-400">
                            {' '}Connect
                        </span>

                    </h1>

                    <p className="mt-8 text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-8">

                        Realtime messaging platform with futuristic UI,
                        immersive communication,
                        premium social experience,
                        and realtime infrastructure.

                    </p>

                </motion.div>

            </section>



            <section className="py-24 px-6">

                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6"
                >

                    {[
                        ['10M+', 'Messages'],
                        ['250K+', 'Users'],
                        ['99.9%', 'Uptime'],
                        ['120+', 'Countries'],
                    ].map((item, index) => (

                        <motion.div
                            key={index}
                            whileHover={{
                                scale: 1.08,
                                rotate: 2,
                            }}
                            className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 text-center shadow-2xl"
                        >

                            <h2 className="text-4xl font-black text-green-400">
                                {item[0]}
                            </h2>

                            <p className="text-gray-300 mt-2">
                                {item[1]}
                            </p>

                        </motion.div>

                    ))}

                </motion.div>

            </section>


            {/* FEATURES SECTION */}

            <section className="min-h-screen flex items-center justify-center px-6 py-24">

                <div className="max-w-7xl grid lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT PANEL */}

                    <motion.div
                        initial={{ opacity: 0, x: -200 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[40px] p-10 shadow-2xl"
                    >

                        <div className="w-20 h-20 rounded-3xl bg-green-500/20 flex items-center justify-center mb-8">

                            <Users className="text-green-400 w-10 h-10" />

                        </div>

                        <h2 className="text-5xl font-black leading-tight mb-8">

                            Smart
                            <span className="text-green-400">
                                {' '}Realtime
                            </span>

                            <br />

                            Conversations

                        </h2>

                        <p className="text-gray-300 text-lg leading-9">

                            Experience lightning-fast messaging,
                            immersive interactions,
                            modern UI transitions,
                            typing indicators,
                            and realtime communication
                            powered by futuristic architecture.

                        </p>

                    </motion.div>


                    {/* RIGHT PANEL */}

                    <motion.div
                        initial={{ opacity: 0, x: 200 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        whileHover={{
                            rotate: 0,
                            scale: 1.03,
                        }}
                        className="relative flex justify-center"
                    >

                        <div className="w-full max-w-[380px] backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[40px] p-8 shadow-2xl rotate-6 transition duration-500">

                            <div className="space-y-5">

                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white/10 rounded-2xl p-4"
                                >

                                    <p className="text-green-400 font-semibold">
                                        Alex
                                    </p>

                                    <p className="text-gray-300 mt-2">
                                        Welcome to ChatSphere 👋
                                    </p>

                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-green-500 rounded-2xl p-4 ml-10"
                                >

                                    <p>
                                        This UI looks futuristic 🔥
                                    </p>

                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-white/10 rounded-2xl p-4"
                                >

                                    <p className="text-gray-300">
                                        Realtime typing and secure messaging.
                                    </p>

                                </motion.div>

                            </div>

                        </div>

                    </motion.div>

                </div>

            </section>


            {/* FEATURE GRID */}

            <section className="py-28 px-6">

                <div className="max-w-7xl mx-auto">

                    <motion.h2
                        initial={{ opacity: 0, y: 80 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-5xl font-black text-center mb-20"
                    >

                        Why People Love
                        <span className="text-green-400">
                            {' '}ChatSphere
                        </span>

                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">

                        {[
                            {
                                icon: Zap,
                                title: 'Ultra Fast Messaging',
                            },
                            {
                                icon: Lock,
                                title: 'Encrypted Chats',
                            },
                            {
                                icon: Globe,
                                title: 'Global Community',
                            },
                            {
                                icon: Video,
                                title: 'HD Video Calls',
                            },
                            {
                                icon: Shield,
                                title: 'Privacy First',
                            },
                            {
                                icon: Sparkles,
                                title: 'AI Features',
                            },
                        ].map((feature, i) => {

                            const Icon = feature.icon;

                            return (

                                <motion.div
                                    key={feature.title}
                                    initial={{
                                        opacity: 0,
                                        y: 100,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        delay: i * 0.15,
                                        duration: 0.7,
                                    }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        y: -15,
                                        scale: 1.03,
                                    }}
                                    className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[35px] p-8 shadow-2xl"
                                >

                                    <div className="w-16 h-16 rounded-3xl bg-green-500/20 flex items-center justify-center mb-6">

                                        <Icon className="text-green-400 w-8 h-8" />

                                    </div>

                                    <h3 className="text-2xl font-bold mb-4">
                                        {feature.title}
                                    </h3>

                                    <p className="text-gray-300 leading-8">

                                        Premium futuristic communication
                                        designed for immersive realtime interaction.

                                    </p>

                                </motion.div>

                            );
                        })}

                    </div>

                </div>

            </section>


            {/* TESTIMONIALS */}

            <section className="py-28 px-6">

                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

                    {['Alex', 'Sophia', 'Jordan'].map((user, i) => (

                        <motion.div
                            key={user}
                            initial={{
                                opacity: 0,
                                y: 100,
                            }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: i * 0.2,
                            }}
                            viewport={{ once: true }}
                            whileHover={{
                                scale: 1.05,
                            }}
                            className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[35px] p-8 shadow-2xl"
                        >

                            <div className="flex gap-1 mb-5">

                                {[1, 2, 3, 4, 5].map((s) => (

                                    <Star
                                        key={s}
                                        className="text-yellow-400 fill-yellow-400 w-5 h-5"
                                    />

                                ))}

                            </div>

                            <p className="text-gray-300 leading-8">

                                “This feels like the future of messaging.
                                Smooth animations and incredible design.”

                            </p>

                            <div className="mt-6">

                                <h3 className="font-bold text-xl">
                                    {user}
                                </h3>

                                <p className="text-green-400">
                                    Verified User
                                </p>

                            </div>

                        </motion.div>

                    ))}

                </div>

            </section>


            {/* CTA SECTION */}

            <section className="relative py-28 px-6 overflow-hidden">

                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-cyan-500/10 blur-3xl"
                />

                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.8,
                    }}
                    whileInView={{
                        opacity: 1,
                        scale: 1,
                    }}
                    transition={{
                        duration: 0.8,
                    }}
                    viewport={{ once: true }}
                    className="relative z-10 max-w-5xl mx-auto text-center backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[50px] p-12 sm:p-16 shadow-2xl"
                >

                    <h2 className="text-5xl sm:text-6xl font-black leading-tight mb-8">

                        Ready To Enter
                        <br />

                        The Future Of Chat?

                    </h2>

                    <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-9">

                        Join thousands of users already experiencing
                        modern communication with premium interface,
                        realtime messaging,
                        and futuristic interactions.

                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-5 mt-10">

                        <Link
                            to="/signup"
                            className="px-8 py-4 rounded-2xl bg-green-500 hover:bg-green-600 transition text-lg font-semibold shadow-2xl"
                        >
                            Create Account
                        </Link>

                        <Link
                            to="/login"
                            className="px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 transition text-lg"
                        >
                            Login
                        </Link>

                    </div>

                </motion.div>

            </section>



        </div>

    );
};

export default Welcome;

