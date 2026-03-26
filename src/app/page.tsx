import Navbar from "@/components/Navbar"
import Image from "next/image"

export default function Home() {

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar links={[
        { href: "https://www.shu.ac.uk/myhallam", label: "My Hallam" },
        { href: "https://www.shu.ac.uk/myhallam/support-at-hallam/tors", label: "About" },
        { href: "/login", label: "Login", primary: true }
      ]} />

      <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-10 py-8">
        <div className="max-w-[90%] w-full mx-auto p-12 bg-white flex flex-col items-center justify-center text-center">
          <Image
            src="/TORS_logo.png"
            width={300}
            height={300}
            alt="T.O.R.S"
            className="w-50 md:w-55 lg:w-60 py-6"
          />

          <div className="px-10 py-10 rounded-xl bg-white p-12 shadow-2xl border flex flex-col items-center justify-center text-center">
            <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-800 mb-4">
              About Us – TORS Healthcare Technical Team
            </h1>

            <p className="text-sm md:text-base lg:text-lg text-[#B80050] font-medium">
              The Technical Operations, Resources and Services (TORS) Healthcare Technical Team at Sheffield Hallam University provides high quality technical expertise that underpins teaching, learning and assessment within the College of Health, Wellbeing and Life Sciences. Our team operates across the Robert Winston Building and the Heart of the Campus, home to Sheffield Hallam University’s Simulated Healthcare Facilities stateoftheart environments designed to replicate real clinical settings and enhance handson, experiential learning.
            </p><br></br>
            <p className="text-sm md:text-base lg:text-lg text-[#B80050] font-medium">
              We support a wide range of healthrelated disciplines including Nursing and Midwifery, Allied Health Professions, and Social Work and Social Care, delivering technical support that integrates traditional clinical skills, advanced healthcare technologies, and emerging modalities such as extended reality (XR) and virtual simulation. Our facilities include advanced patient manikins, a 12bed simulation ward and other simulated healthcare environments, VR platforms, and a wide range of clinical equipment that students can access to develop their confidence and competence in a safe, immersive environment.
            </p><br></br>
            <p className="text-sm md:text-base lg:text-lg text-[#B80050] font-medium">
              As a team made up of highly skilled specialists and clinicians with backgrounds in healthcare engineering, media technologies, and simulation design, we collaborate closely with academic colleagues to enhance student learning. From supporting session delivery and developing innovative simulation resources to providing atelbow XR support and maintaining complex clinical equipment, we ensure students receive an exceptional applied learning experience that prepares them for modern healthcare practice.
            </p><br></br><br></br>

            <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-800 mb-4">
              Our Mission
            </h1><br></br>
            <p className="text-sm md:text-base lg:text-lg text-[#B80050] font-medium">
              Our mission is to empower future healthcare professionals by delivering outstanding technical support, innovative simulationbased learning opportunities, and safe, realistic environments that mirror the evolving demands of clinical practice. Through our commitment to technical excellence, collaborative practice, and innovation—including the integration of advanced patient simulators, clinical technologies, and virtual learning platforms—we aim to enhance the applied learning experience for every student.
            </p><br></br>
            <p className="text-sm md:text-base lg:text-lg text-[#B80050] font-medium">
              We strive to create inclusive, highquality, and futurefocused learning environments where students can develop critical thinking, clinical decisionmaking, and patientcentred skills before entering realworld healthcare settings. By continuously advancing our facilities, embracing new technologies, and supporting research, teaching, and professional practice, we contribute to the development of confident, competent, and placementready healthcare practitioners
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}