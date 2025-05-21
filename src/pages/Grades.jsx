import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

function Grades() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [gradeStructure, setGradeStructure] = useState(null);
  const [grades, setGrades] = useState({});
  const [expectedGrade, setExpectedGrade] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchSubjects = async () => {
      const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubjects(data);
    };
    fetchSubjects();
  }, [user]);

  useEffect(() => {
    if (!selectedSubjectId) {
      setGradeStructure(null);
      setGrades({});
      return;
    }
    const subject = subjects.find(s => s.id === selectedSubjectId);
    if (subject && subject.gradeStructure) {
      let gs = subject.gradeStructure;
      if (typeof gs === 'string') {
        try { gs = JSON.parse(gs); } catch { gs = {}; }
      }
      setGradeStructure(gs);
      setGrades({
        firstCut: '',
        secondCut: '',
        thirdCut: '',
        finalExam: '',
      });
    }
  }, [selectedSubjectId, subjects]);

  const handleGradeChange = (cut, value) => {
    setGrades(prev => ({ ...prev, [cut]: value }));
  };

  const handleCalculate = () => {
    setError('');
    if (!gradeStructure) {
      setError('Selecciona una materia.');
      return;
    }
    let total = 0;
    let usedPercent = 0;
    let missingCuts = [];
    Object.entries(gradeStructure).forEach(([cut, percent]) => {
      const grade = parseFloat(grades[cut]);
      if (!isNaN(grade)) {
        total += (grade * percent) / 100;
        usedPercent += percent;
      } else {
        missingCuts.push({ cut, percent });
      }
    });
    const expected = parseFloat(expectedGrade);
    let message = '';
    if (isNaN(expected)) {
      message = 'Nota final actual: ' + total.toFixed(2);
    } else {
      const percentLeft = 100 - usedPercent;
      if (percentLeft <= 0) {
        if (total >= expected) {
          message = `¡Felicidades! Ya alcanzaste tu meta (${expected}). Nota final: ${total.toFixed(2)}`;
        } else {
          message = `Nota final: ${total.toFixed(2)}. Te faltó ${(expected - total).toFixed(2)} para tu meta.`;
        }
      } else {
        const needed = (expected - total) / (percentLeft / 100);
        if (needed > 5) {
          message = `No es posible alcanzar la meta (${expected}) con los cortes restantes.`;
        } else if (needed <= 0) {
          message = `¡Felicidades! Ya alcanzaste tu meta (${expected}). Nota final estimada: ${total.toFixed(2)}`;
        } else {
          message = `Necesitas sacar al menos ${needed.toFixed(2)} en promedio en los cortes restantes (${missingCuts.map(c => c.cut).join(', ')}) para llegar a tu meta (${expected}).`;
        }
      }
    }
    setResult({ total, message });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-violet-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">¿Cuánto necesito para el final?</h1>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Selecciona una materia:</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
          >
            <option value="">-- Selecciona --</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>
        {gradeStructure && (
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Estructura de notas:</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(gradeStructure).map(([cut, percent]) => (
                <div key={cut}>
                  <label className="block text-sm font-medium capitalize">{cut} ({percent}%)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.01"
                    className="w-full border rounded px-2 py-1"
                    value={grades[cut] || ''}
                    onChange={e => handleGradeChange(cut, e.target.value)}
                    placeholder="Ingresa tu nota"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Nota final que deseas (meta):</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.01"
            className="w-full border rounded px-3 py-2"
            value={expectedGrade}
            onChange={e => setExpectedGrade(e.target.value)}
            placeholder="Ej: 3.5"
          />
        </div>
        <button
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold"
          onClick={handleCalculate}
        >
          Calcular
        </button>
        {error && <div className="mt-4 text-red-500">{error}</div>}
        {result && (
          <div className="mt-4 p-4 bg-blue-50 rounded text-blue-800 font-medium">
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Grades;
