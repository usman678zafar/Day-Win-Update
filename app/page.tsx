import { SignInButton } from "@/components/AuthButtons";
import { auth } from "@/auth";
import { ui } from "@/lib/ui";
import { Amiri } from "next/font/google";
import Link from "next/link";

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  display: "swap",
});

export default async function HomePage() {
  const session = await auth();

  return (
    <div className={ui.page}>
      <article
        className="flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/45 shadow-sm shadow-zinc-950/[0.04] transition-colors duration-300 dark:border-white/10 dark:shadow-none lg:min-h-[calc(100dvh-6rem)] lg:flex-row lg:rounded-3xl"
      >
        <div
          className="relative overflow-hidden px-4 py-8 min-[400px]:px-5 sm:px-8 sm:py-10 lg:w-[min(100%,26rem)] lg:shrink-0 lg:border-r lg:border-emerald-100/90 lg:px-10 lg:py-12 xl:w-[min(100%,30rem)] dark:lg:border-white/10"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-200/45 blur-3xl dark:hidden" />
          <div className="pointer-events-none absolute -bottom-8 -left-6 h-36 w-36 rounded-full bg-amber-100/45 blur-2xl dark:hidden" />
          <div className="relative flex flex-col justify-center gap-5 sm:gap-6">
            <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Win the day together
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base sm:leading-relaxed">
              Habit tracking with squad accountability. Sign in with Google to
              create or join a squad, define habits with your group, and log
              progress everyone can see—while only you check your own cells.
            </p>
            {session?.user ? (
              <Link
                href="/squads"
                className={`${ui.btnPrimary} w-full sm:w-fit`}
              >
                Go to your squads
              </Link>
            ) : (
              <SignInButton />
            )}
            <div className="mt-6 flex justify-center">
              <img
                src="/image.jpg"
                alt="Motivational image for daily habit tracking and growth"
                className="rounded-xl shadow-lg w-full max-w-sm h-auto"
              />
            </div>
          </div>
        </div>

        <div
          className="relative min-h-0 flex-1 border-t border-emerald-100/80 bg-white/55 px-4 py-8 min-[400px]:px-5 sm:px-8 sm:py-10 lg:border-t-0 lg:px-10 lg:py-12 dark:border-white/10 dark:bg-[#262626]"
        >
          <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 lg:max-w-none lg:gap-8">
            <p className={ui.sectionTitle}>A remembrance</p>

            <div className="grid flex-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <figure
                className={`${ui.card} space-y-2.5 !bg-white/90 !shadow-none ring-1 ring-emerald-900/[0.06] sm:!p-5 dark:!bg-[#262626] dark:!shadow-none dark:ring-0`}
              >
                <p
                  lang="ar"
                  dir="rtl"
                  className={`${amiri.className} space-y-1.5 text-[1.05rem] leading-[1.85] text-zinc-900 sm:text-lg sm:leading-[2] dark:text-neutral-200`}
                >
                  <span className="block">وَالْعَصْرِ</span>
                  <span className="block">إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ</span>
                  <span className="block">
                    إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ
                    وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ
                  </span>
                </p>
                <figcaption
                  className={`${ui.muted} space-y-2 border-t border-emerald-100/80 pt-2.5 dark:border-white/10`}
                >
                  <p>
                    <span className="font-medium text-zinc-700 dark:text-neutral-300">
                      Al-ʿAṣr
                    </span>{" "}
                    —
                    By the declining day: mankind is in loss, except those who
                    believe, do good, encourage truth, and encourage patience.
                  </p>
                </figcaption>
              </figure>

              <figure
                className={`${ui.card} space-y-2.5 !bg-white/90 !shadow-none ring-1 ring-emerald-900/[0.06] sm:!p-5 dark:!bg-[#262626] dark:!shadow-none dark:ring-0`}
              >
                <p
                  lang="ar"
                  dir="rtl"
                  className={`${amiri.className} text-[1.05rem] leading-[1.85] text-zinc-900 sm:text-lg sm:leading-[2] dark:text-neutral-200`}
                >
                  قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا
                  تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ
                  الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ
                </p>
                <figcaption
                  className={`${ui.muted} space-y-2 border-t border-emerald-100/80 pt-2.5 dark:border-white/10`}
                >
                  <p>
                    <span className="font-medium text-zinc-700 dark:text-neutral-300">
                      Sūrah Az-Zumar, 39:53
                    </span>{" "}
                    — Say: &ldquo;O My servants who have wronged their own souls,
                    do not despair of Allah&apos;s mercy—He forgives all sins.
                    He is the Most Forgiving, the Most Merciful.&rdquo;
                  </p>
                  <p className="text-zinc-600 dark:text-neutral-400">
                    Maghfirat is vast: tawbah and seeking forgiveness lift what
                    weighs you down, so today can be a fresh stride toward good
                    habits—and a night you sleep lighter.
                  </p>
                </figcaption>
              </figure>
            </div>

            <div
              className={`${ui.muted} space-y-2 rounded-2xl border border-amber-100/90 bg-amber-50/60 px-4 py-3 sm:px-5 sm:py-4 dark:border-white/10 dark:bg-[#262626]`}
            >
              <p
                lang="ur"
                dir="rtl"
                className={`${amiri.className} text-right text-sm leading-[1.9] text-zinc-800 sm:text-base dark:text-neutral-300`}
              >
                جواني کا سوال الگ سے ہوگا—یعنی آپ سے پوچھا جائے گا کہ اس نعمت
                میں آپ نے کیا کیا۔ ہر دن کو سمجھداری سے جینا، اسی تیاری کا حصہ
                ہے۔
              </p>
              <p className="text-xs leading-relaxed sm:text-sm">
                A teaching of the Prophet (peace and blessings be upon him) is
                that each person will be asked{" "}
                <span className="font-medium text-zinc-800 dark:text-neutral-200">
                  how they spent their youth
                </span>{" "}
                among other trusts—so winning the day with intention, truth, and
                sabr is practice for an answer you will want to give with a
                clear heart, not regret.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
