import { getFirestore,collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export async function inserMockData() {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if(!user){
        console.error("no hay un usuario logueado");
        return;
    }

    const userId = user.uid;

    try{
        const subjects = [
            {
                name: "prueba",
                professor: "Prof. Ramírez",
                semester: "2025-1",
                color: "#FF8C00",
                credits: "4",
                schedule: "Lun y Mié 8:00 - 10:00",
                targetGrade: 4.0,
                currentGrade: 0,
                gradeStructure: {
                  firstCut: 0,
                  secondCut: 0,
                  thirdCut: 0,
                  finalExam: 0,
                },
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                userId: userId,
              }
        ];

        const subjectRefs = [];

        for(const subject of subjects){
            const docRef = await addDoc(collection(db, "subjects"), subject);
            subjectRefs.push({id : docRef.id});
        }

        console.log("✅ Mock data insertada correctamente");
    }catch(e){
        console.error("❌ Error al insertar datos: ",e);
    }
}