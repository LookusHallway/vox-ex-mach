# 🎭 Vox Ex Machina — Real-Time Performance System

**Vox Ex Machina** is an artistic, real-time performance robot designed for the Opera Philadelphia's 50th Anniversary Gala in September 2025. It translates live vocal performance into physical, visual art through deterministic, low-latency signal processing, mapping, and hardware control. This system, was deployed in a live environment and performed alonside world-class, Grammy Award-winning vocalists. The robot interprets real-time voice data (pitch and amplitude) and maps it to a controlled spatial motion, producing a trace for each aria in the performance.

---

# My Contribution

I (Luke Hathaway) oversaw the vast majority of the system architecture, design, implementation, and integration, including:
- End-to-end software design, from the concept to the live deployment
- Rigorous system design to maximize modularity and abstraction
- **Real-time audio analysis** pipeline through Max/MSP
- **Motion-mapping algorithm** design that converts signal parameters to XY trajectories using Max and JavaScript
- Development of Arduino-based stepper control, including serial protocol design
- Latency tuning to maintain **near-instantanous system response** (sub 100ms) by using binary instructions and bitwise operations
- UI design with **real-time visualization**, preset management, and robot controls
- Live debugging and fail-safe protocols for performance

## 🧭 Processing Pipeline

### 🎤 **Microphone Input**
- Dynamic routing for five simultaneous microphone sources, one for each singer

### 🧠 **Analysis & Control**
- Amplitude and pitch detection visualized through a piano interface 
- Amplitude and pitch compression for smoothness and reducing noise
- Tunable parameters for each person's voice

### 🎚 **Sliders and Presets**
- Adjustable paramaters for the artistic mappings
- Different types of moving windows over time to cover canvas
	- Spiraling, snaking, shrinking, etc.
	- Each window has its own parameters, such as duration, number of lines, size, etc.
- Different type of mappings to react to voice
	- Theramin, phasor, maze
- Adjustable pitch ranges and thresholds for mappings
- Adjustable mapping lengths depending on aria length

### 🎛 **Mapping**
- The moving windows and the mappings within them are modular
- Instructions on coordinates and speed are then converted to 2 8-bit ints with a trailing newline
- Instructions are sent over serial to Arduino

### 🔧 **Arduino**
- Custom lightweight command parser using bitwise operations
- Motion smoothing with S-curve accceleration/deceleration
- Rigorous testing and optimization for safety and reliability
- Low latency prioritized for synchronization of motors

---
