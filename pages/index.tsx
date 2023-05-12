import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { prisma } from '../lib/prisma'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'

interface FormData {
  title: string
  content: string
  id: string
}

// Array interface
interface Notes {
  notes: {
    id: string
    title: string
    content: string
  }[]
}

// Load notes from getServerSideProps server side rendering
const Home: NextPage<Notes> = ({ notes }) => {
  const [form, setForm] = useState<FormData>({title: '', content: '', id: ''})
  const [newNote, setNewNote] = useState<Boolean>(true)
  const router = useRouter()

  const refreshData = () => {
    router.replace(router.asPath)
  }

  async function handleSubmit(data: FormData) {
    // console.log(data)
    // console.log(newNote)

    try {
      if (newNote) {
        // Check input is not blank
        if (data.title) {
          // CREATE
          fetch('api/create', {
            body: JSON.stringify(data),
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST'
          }).then(() => {
            setForm({title: '', content: '', id: ''})
            refreshData()
          })
        }
        else {
          alert("Title can not be blank")
        }
      }
      else {
        // UPDATE
          fetch(`api/note/${data.id}`, {
            body: JSON.stringify(data),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'PUT'
          }).then(() => {
            setForm({title: '', content: '', id: ''})
            setNewNote(true)
            refreshData()
          })
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function updateNote(title: string, content: string, id: string) {
    //console.log(title, content, id)
    setForm({title, content, id})
    setNewNote(false)
  }

  async function deleteNote(id: string) {
    try {
      fetch(`api/note/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE'
      }).then(() => {
        refreshData()
      })
    } catch (error) {
      console.log(error)
    }    
  }

  function handleCancel() {
    setForm({title: '', content: '', id: ''})
    setNewNote(true)
  }

  return (
    <>
      <Head>
        <title>Notes</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <h1 className="text-center font-bold text-2xl m-4">The Notes</h1>
      <form className="w-auto min-w-[25%] max-w-min mx-auto space-y-6 flex flex-col items-stretch" 
        onSubmit={e => {
          e.preventDefault()
          handleSubmit(form)
      }}>
        <input type="text" 
          placeholder="Title" 
          value={form.title} 
          onChange={e => setForm({...form, title: e.target.value})}
          className="border-2 rounded border-gray-600 p-1"
        />
        <textarea placeholder="Content" 
          value={form.content} 
          onChange={e => setForm({...form, content: e.target.value})} 
          className="border-2 rounded border-gray-600 p-1"
        />
        {newNote ? (
          <button type="submit" className="bg-blue-500 text-white rounded p-1">Add +</button>
        ) : (
          <>
            <button type="submit" className="bg-blue-500 text-white rounded p-1">Update</button>
            <button onClick={handleCancel} className="bg-red-500 text-white rounded p-1">Cancel</button>
          </>
        )}
      </form>

      <div className="w-auto min-w-[25%] max-w-min mt-10 mx-auto space-y-6 flex flex-col items-stretch">
        <h2 className="text-center font-bold text-xl mt-4">Saved Notes</h2>
        <ul>
          {notes.map(note => (
            <li key={note.id} className="border-b border-gray-600 p-2">
              <div className="flex jusify-between">
                <div className="flex-1">
                  <h3 className="font-bold">{note.title}</h3>
                  <p className="text-sm">{note.content}</p>
                </div>
                <button onClick={() => updateNote(note.title, note.content, note.id)} className="bg-blue-500 px-3 text-white rounded">Edit</button>
                <button onClick={() => deleteNote(note.id)} className="bg-red-500 px-3 text-white rounded">X</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Home

// Server side rendering on every request
export const getServerSideProps: GetServerSideProps = async () => {
  // READ all notes from DB
  const notes = await prisma?.note.findMany({
    select: {
      title: true,
      id: true,
      content: true
    }
  })

  return {
    props: {
      notes
    }
  }
}