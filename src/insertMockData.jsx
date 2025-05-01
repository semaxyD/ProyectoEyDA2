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
                name: "Matemáticas",
                professor: "Prof. Ramírez",
                semester: "2025-1",
                color: "#FF8C00",
                credits: "4",
                schedule: "Lun y Mié 8:00 - 10:00",
                targetGrade: 4.0,
                currentGrade: 0,
                firstCut: 0,
                secondCut: 0,
                thirdCut: 0,
                finalExam: 0,
                gradeStructure: {},
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                userId: userId,
              },
              {
                name: "Lengua",
                professor: "Dra. Márquez",
                semester: "2025-1",
                color: "#007ACC",
                credits: "3",
                schedule: "Mar y Jue 10:00 - 11:30",
                targetGrade: 3.5,
                currentGrade: 0,
                firstCut: 0,
                secondCut: 0,
                thirdCut: 0,
                finalExam: 0,
                gradeStructure: {},
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                userId: userId,
              },
              {
                name: "Historia",
                professor: "Lic. Gómez",
                semester: "2025-1",
                color: "#9B59B6",
                credits: "2",
                schedule: "Vie 9:00 - 11:00",
                targetGrade: 3.8,
                currentGrade: 0,
                firstCut: 0,
                secondCut: 0,
                thirdCut: 0,
                finalExam: 0,
                gradeStructure: {},
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

        const tasks = [
            {
                title: "Resolver ejercicios del libro",
                description: "Ejercicios de funciones lineales",
                subjectId: subjectRefs[0].id,
                userId: userId,
                priority: "alta",
                completed: false,
                actualTime: 0,
                estimatedTime: 60,
                attachments: [],
                tags: ["matemáticas"],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                dueDate: new Date("2025-05-01T12:00:00"),
                reminderDate: new Date("2025-04-30T18:00:00"),
              },
              {
                title: "Leer capítulo 3",
                description: "Revolución francesa",
                subjectId: subjectRefs[2].id,
                userId: userId,
                priority: "media",
                completed: false,
                actualTime: 10,
                estimatedTime: 45,
                attachments: [],
                tags: ["historia"],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                dueDate: new Date("2025-05-03T10:00:00"),
                reminderDate: new Date("2025-05-02T20:00:00"),
              },
              {
                title: "Entregar ensayo",
                description: "Ensayo sobre poesía moderna",
                subjectId: subjectRefs[1].id,
                userId: userId,
                priority: "alta",
                completed: true,
                completedAt: new Date(),
                actualTime: 70,
                estimatedTime: 60,
                attachments: [],
                tags: ["lengua"],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                dueDate: new Date("2025-04-28T09:00:00"),
                reminderDate: new Date("2025-04-27T18:00:00"),
              },
              {
                title: "Repasar fechas clave",
                description: "Estudio para parcial",
                subjectId: subjectRefs[2].id,
                userId: userId,
                priority: "baja",
                completed: true,
                completedAt: new Date(),
                actualTime: 30,
                estimatedTime: 30,
                attachments: [],
                tags: ["historia"],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                dueDate: new Date("2025-04-29T08:00:00"),
                reminderDate: new Date("2025-04-28T18:00:00"),
              }
        ];

        for(const task of tasks){
            await addDoc(collection(db,"tasks"), task);
        }

        console.log("✅ Mock data insertada correctamente");
    }catch(e){
        console.error("❌ Error al insertar datos: ",e);
    }
}