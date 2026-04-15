// "use client";
//
// import { useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { ArrowLeft, User, Plus } from "lucide-react";
//
// export default function EditAccountPage() {
//   const router = useRouter();
//   const params = useParams();
//
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [faculty, setFaculty] = useState("IT");
//   const [role, setRole] = useState("Marketing Manager");
//
//   const faculties = ["IT", "Physics", "English", "Arts"];
//   const roles = [
//     "Marketing Coordinator",
//     "Student",
//     "Guest",
//     "Marketing Manager",
//   ];
//
//   const handleSave = (e) => {
//     e.preventDefault();
//
//     if (!fullName || !email) {
//       alert("Please fill in Full Name and Email.");
//       return;
//     }
//
//     alert(`User ID ${params.id} updated successfully!`);
//     router.push("/dashboard");
//   };
//
//   return (
//     <div className="min-h-screen bg-[#e8e3dc] px-6 py-8">
//       <button
//         onClick={() => router.back()}
//         className="mb-8 flex items-center gap-2 rounded-full bg-[#f26b5b] px-6 py-3 text-white"
//       >
//         <ArrowLeft size={18} />
//         Back
//       </button>
//
//       <div className="mx-auto max-w-5xl">
//         <form onSubmit={handleSave} className="space-y-10">
//           <div className="flex flex-col items-center">
//             <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gray-300">
//               <User size={42} className="text-gray-700" />
//               <div className="absolute right-1 top-1 rounded-full bg-gray-500 p-1 text-white">
//                 <Plus size={16} />
//               </div>
//             </div>
//
//             <h2 className="mt-4 text-2xl font-medium text-black">
//               Upload Image
//             </h2>
//             <p className="text-sm text-gray-500">Max file size: 1MB</p>
//           </div>
//
//           <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
//             <div className="space-y-6">
//               <div>
//                 <label className="mb-2 block text-sm text-black">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   className="w-full rounded-md border bg-white px-4 py-3"
//                 />
//               </div>
//
//               <div>
//                 <label className="mb-2 block text-sm text-black">Email</label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="example@gmail.com"
//                   className="w-full rounded-md border bg-white px-4 py-3"
//                 />
//               </div>
//             </div>
//
//             <div className="space-y-6">
//               <div>
//                 <label className="mb-2 block text-sm text-black">Faculty</label>
//                 <select
//                   value={faculty}
//                   onChange={(e) => setFaculty(e.target.value)}
//                   className="w-full rounded-md border bg-white px-4 py-3"
//                 >
//                   {faculties.map((item) => (
//                     <option key={item} value={item}>
//                       {item}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//
//               <div>
//                 <label className="mb-2 block text-sm text-black">Role</label>
//                 <select
//                   value={role}
//                   onChange={(e) => setRole(e.target.value)}
//                   className="w-full rounded-md border bg-white px-4 py-3"
//                 >
//                   {roles.map((item) => (
//                     <option key={item} value={item}>
//                       {item}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//
//             <div className="hidden md:block" />
//           </div>
//
//           <div className="flex justify-center gap-6 pt-6">
//             <button
//               type="button"
//               onClick={() => router.push("/dashboard")}
//               className="rounded-full bg-white px-10 py-3 text-black shadow"
//             >
//               Cancel
//             </button>
//
//             <button
//               type="submit"
//               className="rounded-full bg-[#f26b5b] px-10 py-3 text-black"
//             >
//               Save Changes
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client"

import { usestate } from "react"
import { userouter, useparams } from "next/navigation"
import { arrowleft, user, plus } from "lucide-react"

export default function editaccountpage() {
    const router = userouter()
    const params = useparams()

    const [fullname, setfullname] = usestate("")
    const [email, setemail] = usestate("")
    const [faculty, setfaculty] = usestate("it")
    const [role, setrole] = usestate("marketing manager")

    const faculties = ["it", "physics", "english", "arts"]
    const roles = ["marketing coordinator", "student", "guest", "marketing manager"]

    const handlesave = (e) => {
        e.preventdefault()

        if (!fullname || !email) {
            alert("please fill in full name and email.")
            return
        }

        alert(`user id ${params.id} updated successfully!`)
        router.push("/dashboard")
    }

    return (
        <div classname="min-h-screen bg-[#e8e3dc] px-6 py-8">
            <button
                onclick={() => router.back()}
                classname="mb-8 flex items-center gap-2 rounded-full bg-[#f26b5b] px-6 py-3 text-white"
            >
                <arrowleft size={18} />
                back
            </button>

            <div classname="mx-auto max-w-5xl">
                <form onsubmit={handlesave} classname="space-y-10">
                    <div classname="flex flex-col items-center">
                        <div classname="relative flex h-28 w-28 items-center justify-center rounded-full bg-gray-300">
                            <user size={42} classname="text-gray-700" />
                            <div classname="absolute right-1 top-1 rounded-full bg-gray-500 p-1 text-white">
                                <plus size={16} />
                            </div>
                        </div>

                        <h2 classname="mt-4 text-2xl font-medium text-black">upload image</h2>
                        <p classname="text-sm text-gray-500">max file size: 1mb</p>
                    </div>

                    <div classname="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div classname="space-y-6">
                            <div>
                                <label classname="mb-2 block text-sm text-black">full name</label>
                                <input
                                    type="text"
                                    value={fullname}
                                    onchange={(e) => setfullname(e.target.value)}
                                    classname="w-full rounded-md border bg-white px-4 py-3"
                                />
                            </div>

                            <div>
                                <label classname="mb-2 block text-sm text-black">email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onchange={(e) => setemail(e.target.value)}
                                    placeholder="example@gmail.com"
                                    classname="w-full rounded-md border bg-white px-4 py-3"
                                />
                            </div>
                        </div>

                        <div classname="space-y-6">
                            <div>
                                <label classname="mb-2 block text-sm text-black">faculty</label>
                                <select
                                    value={faculty}
                                    onchange={(e) => setfaculty(e.target.value)}
                                    classname="w-full rounded-md border bg-white px-4 py-3"
                                >
                                    {faculties.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label classname="mb-2 block text-sm text-black">role</label>
                                <select
                                    value={role}
                                    onchange={(e) => setrole(e.target.value)}
                                    classname="w-full rounded-md border bg-white px-4 py-3"
                                >
                                    {roles.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div classname="hidden md:block" />
                    </div>

                    <div classname="flex justify-center gap-6 pt-6">
                        <button
                            type="button"
                            onclick={() => router.push("/dashboard")}
                            classname="rounded-full bg-white px-10 py-3 text-black shadow"
                        >
                            cancel
                        </button>

                        <button
                            type="submit"
                            classname="rounded-full bg-[#f26b5b] px-10 py-3 text-black"
                        
                            save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
