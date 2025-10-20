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
- Amplitude and pitch detection visualized through a piano interface 
- Amplitude and pitch compression for smoothness and reducing noise
- Tunable parameters for each person's voice
<details>
	<summary>Click to see screeshots</summary>
	<img src="Max Screenshots/Input and Paramater Selection/Microphone Input Control.png" alt="Microphone input control" style="width: 400px;" />
<img src="Max Screenshots/Input and Paramater Selection/Unlocked Microphone Input Control.png" alt="Microphone input control" style="width: 400px;" />
</details>

### 🎚 **Sliders and Presets**
- Adjustable paramaters for the artistic mappings
- Different types of moving windows over time to cover canvas
	- Spiraling, snaking, shrinking, etc.
	- Each window has its own parameters, such as duration, number of lines, size, etc.
- Different type of mappings to react to voice
	- Theramin, phasor, maze
- Adjustable pitch ranges and thresholds for mappings
- Adjustable mapping lengths depending on aria length
<details>
	<summary>Click to see screenshots</summary>
	<img src="Max Screenshots/Input and Paramater Selection/Modular Mapping Selection.png" alt="Modular mapping selection" style="width: 600px;" />
</details>
	
### 🎛 **Mapping**
- The moving windows and the mappings within them are modular
- Instructions on coordinates and speed are then converted to 2 8-bit ints with a trailing newline
- Instructions are sent over serial to Arduino
<details>
	<summary>Click to see screenshots</summary>
		<img src="Max Screenshots/Mapping Algorithm/Snake Window.png" alt="Snake Window" style="width: 300px;" />
		<img src="Max Screenshots/Mapping Algorithm/Phasor Mapping .png" alt="Phasor Mapping" style="width: 300px;" />
			<img src="Max Screenshots/Instructions to Serial/Serial Encoding Algorithm.png" alt="Serial Encoding Algorithm" style="width: 600px;" />
	
</details>


### 🔧 **Arduino**
- Custom lightweight command parser using bitwise operations
- Motion smoothing with S-curve accceleration/deceleration
- Rigorous testing and optimization for safety and reliability
- Low latency prioritized for synchronization of motors

---
