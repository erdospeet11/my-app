import { useEffect } from "react"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

interface Note {
  id: string
  title: string
  content: string
  category: string
  created_at: string
}

export function NoteApp() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) {
        setNotes(data)
        if (data.length > 0 && !selectedNoteId) {
          setSelectedNoteId(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null

  const handleNoteSelect = (id: string) => {
    setSelectedNoteId(id)
  }

  const handleNoteCreate = async () => {
    const newNote = {
      title: "New Note",
      content: "",
      category: "Uncategorized",
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single()

      if (error) throw error
      if (data) {
        setNotes([data, ...notes])
        setSelectedNoteId(data.id)
      }
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const handleNoteUpdate = async (updatedNote: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update(updatedNote)
        .eq('id', updatedNote.id)

      if (error) throw error
      setNotes(notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const handleNoteDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error
      setNotes(notes.filter((note) => note.id !== id))
      if (selectedNoteId === id) {
        setSelectedNoteId(notes.length > 0 ? notes[0].id : null)
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  useEffect(() => {
    async function testConnection() {
      try {
        setConnectionStatus('testing')
        const { data, error } = await supabase
          .from('notes')
          .select('count')
          .limit(1)
        
        if (error) {
          throw error
        }
        
        console.log('Supabase connection successful!', data)
        setConnectionStatus('success')
      } catch (error) {
        console.error('Supabase connection error:', error)
        setConnectionStatus('error')
      }
    }

    testConnection()
  }, [])

  const connectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'testing':
        return <span className="text-yellow-500">Testing connection...</span>
      case 'success':
        return <span className="text-green-500">Connected to database</span>
      case 'error':
        return <span className="text-red-500">Database connection error</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a1a] text-slate-100">
        <div className="text-center space-y-4">
          <div className="text-2xl">Loading notes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a1a] text-slate-100">
      <header className="border-b border-slate-800 bg-[#050510] p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-orbit-icon lucide-orbit">
                <circle cx="12" cy="12" r="3"/>
                <circle cx="19" cy="5" r="2"/>
                <circle cx="5" cy="19" r="2"/>
                <path d="M10.4 21.9a10 10 0 0 0 9.941-15.416"/>
                <path d="M13.5 2.1a10 10 0 0 0-9.841 15.416"/>
            </svg>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">
            Cosmic Notes
          </h1>
          {connectionStatusDisplay()}
        </div>
        <button
          onClick={handleNoteCreate}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-none px-4 py-2 rounded-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          New Note
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r border-slate-800 bg-[#050510] overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-slate-300">My Notes</h2>
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg cursor-pointer group relative transition-all duration-200 ${
                    selectedNoteId === note.id
                      ? "bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-purple-500/30"
                      : "hover:bg-slate-800/50 border border-transparent"
                  }`}
                  onClick={() => handleNoteSelect(note.id)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate text-slate-200">{note.title}</h3>
                    <button
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none text-slate-400 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNoteDelete(note.id)
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-1">
                    {note.content.substring(0, 50)}
                    {note.content.length > 50 ? "..." : ""}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {note.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {selectedNote ? (
          <NoteEditor note={selectedNote} onUpdateNote={handleNoteUpdate} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 bg-[#050510]">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
                No Note Selected
              </div>
              <p className="text-slate-400">Select a note or create a new one to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function NoteEditor({ note, onUpdateNote }: { note: Note; onUpdateNote: (note: Note) => void }) {
  const [editedNote, setEditedNote] = useState<Note>(note)

  useEffect(() => {
    setEditedNote(note)
  }, [note])

  const handleChange = (field: keyof Note, value: string) => {
    const updatedNote = { ...editedNote, [field]: value }
    setEditedNote(updatedNote)
    onUpdateNote(updatedNote)
  }

  const categories = ["Uncategorized", "Work", "Personal", "Ideas", "Inspiration"]

  return (
    <div className="flex-1 p-6 bg-[#050510] overflow-y-auto flex flex-col h-full">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full space-y-6">
        <div className="flex flex-row gap-4 items-start">
          <input
            type="text"
            value={editedNote.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="flex-1 text-xl font-semibold bg-[#0f0f1f] border border-slate-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Note Title"
          />

          <select
            value={editedNote.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-48 bg-[#0f0f1f] border border-slate-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <textarea
            value={editedNote.content}
            onChange={(e) => handleChange("content", e.target.value)}
            className="flex-1 min-h-0 h-full bg-[#0f0f1f] border border-slate-700 rounded-md p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Write your cosmic thoughts here..."
          />
        </div>
      </div>
    </div>
  )
}

