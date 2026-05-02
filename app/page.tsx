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
    <div className={ui.pageHome}>
      <div
        className={`${ui.card} relative overflow-hidden border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/40`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-amber-100/50 blur-2xl" />
        <div className="relative space-y-3 sm:space-y-5">
          <p className={ui.badge}>Squad habits · daily wins</p>
          <h1 className={ui.headingPage}>Win the day together</h1>
          <p className={`${ui.muted} max-w-prose`}>
            Habit tracking with squad accountability. Sign in with Google to
            create or join a squad, define habits with your group, and log
            progress everyone can see—while only you check your own cells.
          </p>

          <div className="space-y-4 border-t border-emerald-100/90 pt-4 sm:space-y-5 sm:pt-5">
            <p className={ui.sectionTitle}>A remembrance</p>

            <figure className="space-y-2.5 rounded-xl bg-white/70 p-3.5 shadow-sm ring-1 ring-emerald-900/[0.06] sm:p-4">
              <p
                lang="ar"
                dir="rtl"
                className={`${amiri.className} space-y-1.5 text-[1.05rem] leading-[1.85] text-zinc-900 sm:text-lg sm:leading-[2]`}
              >
                <span className="block">وَالْعَصْرِ</span>
                <span className="block">إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ</span>
                <span className="block">
                  إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ
                  وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ
                </span>
              </p>
              <figcaption
                className={`${ui.muted} max-w-prose space-y-2 border-t border-emerald-100/80 pt-2.5`}
              >
                <p>
                  <span className="font-medium text-zinc-700">Al-ʿAṣr</span> —
                  By the declining day: mankind is in loss, except those who
                  believe, do good, encourage truth, and encourage patience.
                </p>
              </figcaption>
            </figure>

            <div
              className={`${ui.muted} space-y-2 rounded-xl border border-amber-100/90 bg-amber-50/50 px-3 py-2.5 sm:px-4 sm:py-3`}
            >
              <p
                lang="ur"
                dir="rtl"
                className={`${amiri.className} text-right text-sm leading-[1.9] text-zinc-800 sm:text-base`}
              >
                جواني کا سوال الگ سے ہوگا—یعنی آپ سے پوچھا جائے گا کہ اس نعمت
                میں آپ نے کیا کیا۔ ہر دن کو سمجھداری سے جینا، اسی تیاری کا حصہ
                ہے۔
              </p>
              <p className="text-xs leading-relaxed sm:text-sm">
                A teaching of the Prophet (peace and blessings be upon him) is
                that each person will be asked{" "}
                <span className="font-medium text-zinc-800">
                  how they spent their youth
                </span>{" "}
                among other trusts—so winning the day with intention, truth, and
                sabr is practice for an answer you will want to give with a
                clear heart, not regret.
              </p>
            </div>

            <figure className="space-y-2.5 rounded-xl bg-white/70 p-3.5 shadow-sm ring-1 ring-emerald-900/[0.06] sm:p-4">
              <p
                lang="ar"
                dir="rtl"
                className={`${amiri.className} text-[1.05rem] leading-[1.85] text-zinc-900 sm:text-lg sm:leading-[2]`}
              >
                قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا
                تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ
                الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ
              </p>
              <figcaption
                className={`${ui.muted} max-w-prose space-y-2 border-t border-emerald-100/80 pt-2.5`}
              >
                <p>
                  <span className="font-medium text-zinc-700">
                    Sūrah Az-Zumar, 39:53
                  </span>{" "}
                  — Say: &ldquo;O My servants who have wronged their own souls,
                  do not despair of Allah&apos;s mercy—He forgives all sins. He
                  is the Most Forgiving, the Most Merciful.&rdquo;
                </p>
                <p className="text-zinc-600">
                  Maghfirat is vast: tawbah and seeking forgiveness lift what
                  weighs you down, so today can be a fresh stride toward good
                  habits—and a night you sleep lighter.
                </p>
              </figcaption>
            </figure>
          </div>

          {session?.user ? (
            <Link href="/squads" className={`${ui.btnPrimary} w-full sm:w-auto`}>
              Go to your squads
            </Link>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </div>
  );
}
