import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Pie, Line } from 'react-chartjs-2'
import { getAuth } from 'firebase/auth';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
)

export default function ProgressOverview() {
  const [completed, setCompleted] = useState(0)
  const [pending, setPending] = useState(0)

  const pieData = {
    labels: ['Completado', 'Pendiente'],
    datasets: [
      {
        data: [completed, pending],
        backgroundColor: ['#4ade80', '#f87171'],
        borderWidth: 1,
      },
    ],
  }

  const pieOptions = {
    responsive: true,
    animation: {
      animateRotate: true,
      duration: 800,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#374151',
          font: {
            size: 14,
          },
        },
      },
    },
  }

  const lineData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Tareas completadas por día',
        data: [1, 3, 2, 4, 1, 0, 2],
        fill: false,
        borderColor: '#60a5fa',
        tension: 0.3,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false
  }

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if(!user){
        console.error("No hay un usuario logueado");
        return;
      }

    const userId = user.uid;

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let completedCount = 0
      let pendingCount = 0

      snapshot.forEach((doc) => {
        const task = doc.data()
        if (task.Completed) {
          completedCount++
        } else {
          pendingCount++
        }
      })

      setCompleted(completedCount)
      setPending(pendingCount)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card Gráfico de pastel */}
      <Card className="p-4">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Avance general</h3>
          <div className="w-40 h-40">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Card Gráfico de línea */}
      <Card className="p-4">
        <CardContent className="flex flex-col space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Progreso semanal (Mock)</h3>
          <div className="h-[200px]">
            <Line data={lineData} options={lineOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
