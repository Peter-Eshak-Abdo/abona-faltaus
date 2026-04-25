import React from 'react';

/**
 * DebugTestPage component.
 *
 * This page serves as a dedicated sandbox for ad-hoc testing and debugging.
 * It was created in response to a vague task "Test من debug script" to provide
 * an isolated environment for developers to implement and test specific
 * components, functionalities, or scripts without affecting main application routes.
 */
export default function DebugTestPage() {
  const taskTitle = "✅ Test 14:05:40";
  const taskDescription = "Test من debug script";
  const currentTime = new Date().toLocaleString();

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
        Debug Test Page
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#555' }}>
        This page is a dedicated environment for ad-hoc testing and debugging purposes.
        Developers can use this space to quickly implement and test specific components,
        API calls, or logic without affecting the main application flow.
      </p>

      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '1.5rem',
        marginTop: '2rem',
        backgroundColor: '#f9f9f9'
      }}>
        <h2 style={{ color: '#444', marginBottom: '1rem' }}>Originating Task Details:</h2>
        <p><strong>Task Title:</strong> {taskTitle}</p>
        <p><strong>Task Description:</strong> {taskDescription}</p>
        <p><strong>Page Generated At:</strong> {currentTime}</p>
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <h3 style={{ color: '#444', borderBottom: '1px dashed #eee', paddingBottom: '0.5rem' }}>
          Testing Area
        </h3>
        <p style={{ color: '#666' }}>
          Add your components, state tests, API call demonstrations, or any other debug-related code below this line.
        </p>
        {/* 
          Example: 
          <section style={{ border: '1px dashed #ccc', padding: '1rem', marginTop: '1rem' }}>
            <h4>My Test Component</h4>
            <p>This is where I can test new features or debug existing ones.</p>
            <button onClick={() => alert('Button clicked!')}>Click Me</button>
          </section>
        */}
      </div>
    </div>
  );
}
