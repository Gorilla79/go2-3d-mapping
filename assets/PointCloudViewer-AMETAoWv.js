import{B as e,D as t,E as n,G as r,J as i,K as a,O as o,P as s,R as c,U as l,V as u,Y as d,_ as f,h as p,i as m,j as h,m as g,n as _,o as v,p as y,q as b,r as x,s as S,t as C,v as w,x as T,y as E,z as D}from"./three.module-Cm_kK48t.js";import{t as O}from"./OrbitControls-DAs9RqDT.js";var k={"2F":{azimuth:-30,elevation:52},"3F":{azimuth:-25,elevation:40},"4F":{azimuth:-38,elevation:30},"6F":{azimuth:-25,elevation:40},"8F":{azimuth:-25,elevation:40}},A={azimuth:-30,elevation:40},ee=e=>k[e]??A,j=new m,M=new b,N=class extends f{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type=`LineSegmentsGeometry`,this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute(`position`,new y([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute(`uv`,new y([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new w(t,6,1);return this.setAttribute(`instanceStart`,new E(n,3,0)),this.setAttribute(`instanceEnd`,new E(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new w(t,6,1);return this.setAttribute(`instanceColorStart`,new E(n,3,0)),this.setAttribute(`instanceColorEnd`,new E(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new d(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new m);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),j.setFromBufferAttribute(t),this.boundingBox.union(j))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new u),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let r=0;for(let i=0,a=e.count;i<a;i++)M.fromBufferAttribute(e,i),r=Math.max(r,n.distanceToSquared(M)),M.fromBufferAttribute(t,i),r=Math.max(r,n.distanceToSquared(M));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.`,this)}}toJSON(){}};_.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new a},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},C.line={uniforms:r.merge([_.common,_.fog,_.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		float trimSegmentAlpha( const in vec4 start, const in vec4 end ) {

			// compute the interpolation factor needed to trim the segment so it terminates
			// between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column

			// we need different nearEstimate formula for reversed and default depth buffer
			// a is positive with a reversed depth buffer so it can be used for controlling the code flow
			float nearEstimate = ( a > 0.0 ) ? ( - b / ( a + 1.0 ) ) : ( - 0.5 * b / a );

			return ( nearEstimate - start.z ) / ( end.z - start.z );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef USE_DASH

				float lineDistanceStart = dashScale * instanceDistanceStart;
				float lineDistanceEnd = dashScale * instanceDistanceEnd;

			#endif

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( start, end );
					end.xyz = mix( start.xyz, end.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceEnd = mix( lineDistanceStart, lineDistanceEnd, alpha );

					#endif

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( end, start );
					start.xyz = mix( end.xyz, start.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceStart = mix( lineDistanceEnd, lineDistanceStart, alpha );

					#endif

				}

			}

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? lineDistanceStart : lineDistanceEnd;
				vUv = uv;

			#endif

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};var P=class extends e{constructor(e){super({type:`LineMaterial`,uniforms:r.clone(C.line.uniforms),vertexShader:C.line.vertexShader,fragmentShader:C.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return`WORLD_UNITS`in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS=``:delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return`USE_DASH`in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH=``:delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return`USE_ALPHA_TO_COVERAGE`in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE=``:delete this.defines.USE_ALPHA_TO_COVERAGE)}},F=new i,I=new b,L=new b,R=new i,z=new i,B=new i,V=new b,H=new t,U=new T,W=new b,G=new m,K=new u,q=new i,J,Y;function X(e,t,n){return q.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),q.multiplyScalar(1/q.w),q.x=Y/n.width,q.y=Y/n.height,q.applyMatrix4(e.projectionMatrixInverse),q.multiplyScalar(1/q.w),Math.abs(Math.max(q.x,q.y))}function te(e,t){let n=e.matrixWorld,r=e.geometry,i=r.attributes.instanceStart,a=r.attributes.instanceEnd,o=Math.min(r.instanceCount,i.count);for(let r=0,s=o;r<s;r++){U.start.fromBufferAttribute(i,r),U.end.fromBufferAttribute(a,r),U.applyMatrix4(n);let o=new b,s=new b;J.distanceSqToSegment(U.start,U.end,s,o),s.distanceTo(o)<Y*.5&&t.push({point:s,pointOnLine:o,distance:J.origin.distanceTo(s),object:e,face:null,faceIndex:r,uv:null,uv1:null})}}function ne(e,t,r){let i=t.projectionMatrix,a=e.material.resolution,o=e.matrixWorld,s=e.geometry,c=s.attributes.instanceStart,l=s.attributes.instanceEnd,u=Math.min(s.instanceCount,c.count),d=-t.near;J.at(1,B),B.w=1,B.applyMatrix4(t.matrixWorldInverse),B.applyMatrix4(i),B.multiplyScalar(1/B.w),B.x*=a.x/2,B.y*=a.y/2,B.z=0,V.copy(B),H.multiplyMatrices(t.matrixWorldInverse,o);for(let t=0,s=u;t<s;t++){if(R.fromBufferAttribute(c,t),z.fromBufferAttribute(l,t),R.w=1,z.w=1,R.applyMatrix4(H),z.applyMatrix4(H),R.z>d&&z.z>d)continue;if(R.z>d){let e=R.z-z.z,t=(R.z-d)/e;R.lerp(z,t)}else if(z.z>d){let e=z.z-R.z,t=(z.z-d)/e;z.lerp(R,t)}R.applyMatrix4(i),z.applyMatrix4(i),R.multiplyScalar(1/R.w),z.multiplyScalar(1/z.w),R.x*=a.x/2,R.y*=a.y/2,z.x*=a.x/2,z.y*=a.y/2,U.start.copy(R),U.start.z=0,U.end.copy(z),U.end.z=0;let s=U.closestPointToPointParameter(V,!0);U.at(s,W);let u=n.lerp(R.z,z.z,s),f=u>=-1&&u<=1,p=V.distanceTo(W)<Y*.5;if(f&&p){U.start.fromBufferAttribute(c,t),U.end.fromBufferAttribute(l,t),U.start.applyMatrix4(o),U.end.applyMatrix4(o);let n=new b,i=new b;J.distanceSqToSegment(U.start,U.end,i,n),r.push({point:i,pointOnLine:n,distance:J.origin.distanceTo(i),object:e,face:null,faceIndex:t,uv:null,uv1:null})}}}var re=class extends o{constructor(e=new N,t=new P({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type=`LineSegments2`}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let e=0,i=0,a=t.count;e<a;e++,i+=2)I.fromBufferAttribute(t,e),L.fromBufferAttribute(n,e),r[i]=i===0?0:r[i-1],r[i+1]=r[i]+I.distanceTo(L);let i=new w(r,2,1);return e.setAttribute(`instanceDistanceStart`,new E(i,1,0)),e.setAttribute(`instanceDistanceEnd`,new E(i,1,1)),this}raycast(e,t){let n=this.material.worldUnits,r=e.camera;if(r===null&&!n&&console.error(`LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.`),n===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let i=e.params.Line2===void 0?0:e.params.Line2.threshold||0;J=e.ray;let a=this.matrixWorld,o=this.geometry,s=this.material;Y=s.linewidth+i,o.boundingSphere===null&&o.computeBoundingSphere(),K.copy(o.boundingSphere).applyMatrix4(a);let c;if(c=n?Y*.5:X(r,Math.max(r.near,K.distanceToPoint(J.origin)),s.resolution),K.radius+=c,J.intersectsSphere(K)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),G.copy(o.boundingBox).applyMatrix4(a);let l;l=n?Y*.5:X(r,Math.max(r.near,G.distanceToPoint(J.origin)),s.resolution),G.expandByScalar(l),J.intersectsBox(G)!==!1&&(n?te(this,t):ne(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(F),this.material.uniforms.resolution.value.set(F.z,F.w))}},Z=class extends N{constructor(){super(),this.isLineGeometry=!0,this.type=`LineGeometry`}setPositions(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setPositions(n),this}setColors(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setColors(n),this}setFromPoints(e){let t=e.length-1,n=new Float32Array(6*t);for(let r=0;r<t;r++)n[6*r]=e[r].x,n[6*r+1]=e[r].y,n[6*r+2]=e[r].z||0,n[6*r+3]=e[r+1].x,n[6*r+4]=e[r+1].y,n[6*r+5]=e[r+1].z||0;return super.setPositions(n),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}},ie=class extends re{constructor(e=new Z,t=new P({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type=`Line2`}},ae=`
uniform float uSize;
uniform float uPixelRatio;
uniform int uMode;
uniform float uZMin;
uniform float uZMax;
uniform vec3 uMono;

attribute vec3 rgb;

varying vec3 vColor;

// Polynomial fit of the viridis colour map (perceptually uniform, CVD-friendly).
vec3 viridis(float t) {
  const vec3 c0 = vec3(0.2777273272234177, 0.005407344544966578, 0.3340998053353061);
  const vec3 c1 = vec3(0.1050930431085774, 1.404613529898575, 1.384590162594685);
  const vec3 c2 = vec3(-0.3308618287255563, 0.214847559468213, 0.09509516302823659);
  const vec3 c3 = vec3(-4.634230498983486, -5.799100973351585, -19.33244095627987);
  const vec3 c4 = vec3(6.228269936347081, 14.17993336680509, 56.69055260068105);
  const vec3 c5 = vec3(4.776384997670288, -13.74514537774601, -65.35303263337234);
  const vec3 c6 = vec3(-5.435455855934631, 4.645852612178535, 26.3124352495832);
  return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
}

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio;

  if (uMode == 2) {
    vColor = rgb;
  } else if (uMode == 1) {
    vColor = uMono;
  } else {
    float t = clamp((position.z - uZMin) / max(uZMax - uZMin, 1e-3), 0.0, 1.0);
    vColor = viridis(t);
  }
}
`,oe=`
uniform float uSize;
varying vec3 vColor;

void main() {
  if (uSize >= 2.5) {
    vec2 d = gl_PointCoord - vec2(0.5);
    if (dot(d, d) > 0.25) discard;
  }
  gl_FragColor = vec4(vColor, 1.0);
}
`,se={height:0,monochrome:1,rgb:2},ce=`
uniform float uPixelRatio;
attribute vec3 color;
attribute float size;
varying vec3 vColor;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * uPixelRatio;
  vColor = color;
}
`,le=`
varying vec3 vColor;
void main() {
  float r = length(gl_PointCoord - vec2(0.5));
  if (r > 0.5) discard;
  // dark outline keeps the marker legible on any point colour
  vec3 c = r > 0.36 ? vec3(0.04, 0.06, 0.09) : vColor;
  gl_FragColor = vec4(c, 1.0);
}
`,Q=1120291;function ue(){try{let e=document.createElement(`canvas`);return!!(e.getContext(`webgl2`)??e.getContext(`webgl`))}catch{return!1}}function de(e,t,n=2e5){let[r,i]=$(e,t,2,.01,n);return i>r?[r,i]:[r-.5,r+.5]}function $(e,t,n,r,i=2e5){let a=Math.max(1,Math.floor(t/i)),o=Math.floor((t-1)/a)+1,s=new Float32Array(o);for(let t=0,r=0;r<o;t+=a,r++)s[r]=e[t*3+n];return s.sort(),[s[Math.floor(o*r)],s[Math.min(o-1,Math.floor(o*(1-r)))]]}function fe(e,t,n,r,i){let[a,o,s]=n,[c,l,u]=r,d=i*i,f=-1,p=1/0,m=1/0;for(let n=0;n<t;n++){let t=e[n*3]-a,r=e[n*3+1]-o,i=e[n*3+2]-s,h=t*c+r*l+i*u;if(h<=0)continue;let g=t*t+r*r+i*i-h*h;if(g>d*h*h)continue;let _=g/(h*h);(h<p*.99||h<=p*1.01&&_<m)&&(h<p&&(p=h),f=n,m=_)}return f}var pe=class{container;onStats;onContextLost;renderer;scene=new D;camera;controls;material;markerMaterial;resizeObserver;overlay;grid;points=null;data=null;trajectory=null;trajLabels=[];trajLabelText=[`Start`,`End`];lineMaterials=[];measureGroup=null;measureLabel=null;measure={points:[],distance:null};measuring=!1;onMeasure=null;downAt=null;box=new m(new b(-10,-10,-1),new b(10,10,3));fitBox=this.box.clone();sample=null;preset={azimuth:-35,elevation:38};frame=0;fpsFrames=0;fpsT0=performance.now();disposed=!1;reveal=null;cameraListener=null;applyingCamera=!1;constructor(t,n,r=()=>{}){this.container=t,this.onStats=n,this.onContextLost=r,this.renderer=new x({antialias:!1,alpha:!0,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.setClearColor(Q,0),this.renderer.domElement.className=`viewer-canvas`,t.appendChild(this.renderer.domElement),this.overlay=document.createElement(`div`),this.overlay.className=`viewer-overlay`,this.overlay.setAttribute(`aria-hidden`,`true`),t.appendChild(this.overlay),this.camera=new h(45,1,.05,2e3),this.camera.up.set(0,0,1),this.controls=new O(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.12,this.controls.screenSpacePanning=!0,this.controls.maxDistance=1500,this.material=new e({vertexShader:ae,fragmentShader:oe,uniforms:{uSize:{value:1.5},uPixelRatio:{value:this.renderer.getPixelRatio()},uMode:{value:0},uZMin:{value:0},uZMax:{value:3},uMono:{value:new b(.72,.77,.83)}}}),this.markerMaterial=new e({vertexShader:ce,fragmentShader:le,uniforms:{uPixelRatio:{value:this.renderer.getPixelRatio()}},depthTest:!1,transparent:!0}),this.grid=new g(240,240,2765890,1778480),this.grid.rotation.x=Math.PI/2;let i=this.grid.material;i.transparent=!0,i.opacity=.55,i.depthWrite=!1,this.scene.add(this.grid);let a=this.renderer.domElement;a.addEventListener(`pointerdown`,this.onPointerDown),a.addEventListener(`pointerup`,this.onPointerUp),a.addEventListener(`webglcontextlost`,this.handleContextLost),this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(t),this.resize(),this.setView(`reset`),this.loop()}setPoints(e,t){this.clearPoints();let n=new S;n.setAttribute(`position`,new v(e.positions,3)),e.colors&&n.setAttribute(`rgb`,new v(e.colors,3,!0)),n.computeBoundingBox(),n.computeBoundingSphere(),this.box=n.boundingBox.clone();let r=$(e.positions,e.count,0,.005),i=$(e.positions,e.count,1,.005),a=$(e.positions,e.count,2,.005);this.fitBox=new m(new b(r[0],i[0],a[0]),new b(r[1],i[1],a[1]));let o=Math.max(1,Math.floor(e.count/2e4)),c=Math.floor((e.count-1)/o)+1;this.sample=new Float32Array(c*3);for(let t=0,n=0;n<c;t+=o,n++)this.sample.set(e.positions.subarray(t*3,t*3+3),n*3);let[l,u]=de(e.positions,e.count);this.material.uniforms.uZMin.value=l,this.material.uniforms.uZMax.value=u,this.points=new s(n,this.material),this.points.frustumCulled=!1,this.scene.add(this.points),this.data=e;let d=this.fitBox.getCenter(new b);this.grid.position.set(Math.round(d.x),Math.round(d.y),t-.01)}clearPoints(){this.clearMeasure(),this.points&&(this.scene.remove(this.points),this.points.geometry.dispose(),this.points=null,this.data=null,this.sample=null)}revealPoints(e){this.points&&(e<=0?(this.reveal=null,this.points.geometry.setDrawRange(0,1/0)):(this.points.geometry.setDrawRange(0,0),this.reveal={t0:performance.now(),ms:e}))}memoryInfo(){let e=this.renderer.info.memory;return{geometries:e.geometries,textures:e.textures}}hasPoints(){return!!this.points}hasRgb(){return!!this.points?.geometry.getAttribute(`rgb`)}setTrajectory(e){if(this.trajectory){this.scene.remove(this.trajectory),this.disposeGroup(this.trajectory),this.trajectory=null,this.lineMaterials=this.lineMaterials.filter(e=>!e.userData.traj);for(let e of this.trajLabels)e.el.remove();this.trajLabels=[]}if(!e||e.length<6)return;let t=new p,n=this.makeLine(e,16735370,1.6,.9);n.material.userData.traj=!0,t.add(n);let r=e.length,i=new b(e[0],e[1],e[2]),a=new b(e[r-3],e[r-2],e[r-1]);t.add(this.makeMarkers([i,a],[[.18,.83,.75],[.98,.72,.25]],11)),this.trajLabels=[{el:this.makeLabel(this.trajLabelText[0],`vl-start`),pos:i},{el:this.makeLabel(this.trajLabelText[1],`vl-end`),pos:a}],t.visible=!1;for(let e of this.trajLabels)e.el.hidden=!0;this.trajectory=t,this.scene.add(t)}setTrajectoryLabels(e,t){this.trajLabelText=[e,t],this.trajLabels.forEach((e,t)=>{e.el.textContent=this.trajLabelText[t]})}setTrajectoryVisible(e){if(this.trajectory){this.trajectory.visible=e;for(let t of this.trajLabels)t.el.hidden=!e}}setPointSize(e){this.material.uniforms.uSize.value=e}setColorMode(e){let t=e===`rgb`&&!this.hasRgb()?`height`:e;this.material.uniforms.uMode.value=se[t]}setGridVisible(e){this.grid.visible=e}heightRange(){return[this.material.uniforms.uZMin.value,this.material.uniforms.uZMax.value]}setDefaultPreset(e){this.preset=e}fitDistance(e,t,r=1.06){let i=t.getCenter(new b),a=e.clone().negate().normalize(),o=new b().crossVectors(a,this.camera.up);o.lengthSq()<1e-8&&o.set(1,0,0),o.normalize();let s=new b().crossVectors(o,a).normalize(),c=Math.tan(n.degToRad(this.camera.fov)/2),l=c*this.camera.aspect,u=0;for(let e=0;e<8;e++){let n=new b(e&1?t.max.x:t.min.x,e&2?t.max.y:t.min.y,e&4?t.max.z:t.min.z).sub(i),r=n.dot(a);u=Math.max(u,r+Math.abs(n.dot(o))/l,r+Math.abs(n.dot(s))/c)}return u*r}frameView(e){let t=this.fitBox,r=t.getCenter(new b);if(!this.sample)return{target:r,distance:this.fitDistance(e,t)};let i=e.clone().negate().normalize(),a=new b().crossVectors(i,this.camera.up);a.lengthSq()<1e-8&&a.set(1,0,0),a.normalize();let o=new b().crossVectors(a,i).normalize(),s=this.sample,c=s.length/3,l=new Float32Array(c),u=new Float32Array(c),d=new Float32Array(c);for(let e=0;e<c;e++){let t=s[e*3]-r.x,n=s[e*3+1]-r.y,c=s[e*3+2]-r.z;l[e]=t*a.x+n*a.y+c*a.z,u[e]=t*o.x+n*o.y+c*o.z,d[e]=t*i.x+n*i.y+c*i.z}let f=(e,t)=>{let n=Float32Array.from(e).sort();return n[Math.min(n.length-1,Math.max(0,Math.floor(n.length*t)))]},p=(f(l,.005)+f(l,.995))/2,m=(f(u,.005)+f(u,.995))/2,h=Math.tan(n.degToRad(this.camera.fov)/2),g=h*this.camera.aspect,_=new Float32Array(c);for(let e=0;e<c;e++)_[e]=d[e]+Math.max(Math.abs(l[e]-p)/g,Math.abs(u[e]-m)/h);return{target:r.clone().addScaledVector(a,p).addScaledVector(o,m),distance:Math.max(1,f(_,.998)*1.06)}}setView(e){let t;switch(e){case`top`:{let e=this.fitBox.getSize(new b);t=e.y>e.x?new b(-.001,0,1):new b(0,-.001,1);break}case`front`:t=new b(0,-1,1e-4);break;case`side`:t=new b(1,0,1e-4);break;case`fit`:t=this.camera.position.clone().sub(this.controls.target);break;default:{let e=n.degToRad(this.preset.azimuth),r=n.degToRad(this.preset.elevation);t=new b(Math.sin(e)*Math.cos(r),-Math.cos(e)*Math.cos(r),Math.sin(r))}}t.normalize();let{target:r,distance:i}=this.frameView(t);this.camera.position.copy(r).addScaledVector(t,i),this.updateClip(),this.controls.target.copy(r),this.controls.update()}getCamera(){let e=this.camera.position,t=this.controls.target;return{position:[e.x,e.y,e.z],target:[t.x,t.y,t.z]}}setCamera(e){this.camera.position.set(...e.position),this.controls.target.set(...e.target),this.updateClip(),this.applyingCamera=!0,this.controls.update(),this.applyingCamera=!1}onCameraChange(e){this.cameraListener&&this.controls.removeEventListener(`change`,this.cameraListener),this.cameraListener=e?()=>{this.applyingCamera||e(this.getCamera())}:null,this.cameraListener&&this.controls.addEventListener(`change`,this.cameraListener)}updateClip(){let e=this.box.getSize(new b).length();this.camera.near=Math.max(.02,e/5e3),this.camera.far=Math.max(500,e*20),this.camera.updateProjectionMatrix()}nudge(e){let t=this.camera.position.clone().sub(this.controls.target),r=new l().setFromVector3(new b(t.x,t.z,-t.y)),i=n.degToRad(7);e===`orbit-left`&&(r.theta-=i),e===`orbit-right`&&(r.theta+=i),e===`orbit-up`&&(r.phi=Math.max(.01,r.phi-i)),e===`orbit-down`&&(r.phi=Math.min(Math.PI-.01,r.phi+i)),e===`zoom-in`&&(r.radius*=.85),e===`zoom-out`&&(r.radius/=.85);let a=new b().setFromSpherical(r);this.camera.position.copy(this.controls.target).add(new b(a.x,-a.z,a.y)),this.controls.update()}setMeasureMode(e,t){this.measuring=e,this.onMeasure=t,this.renderer.domElement.classList.toggle(`measuring`,e)}clearMeasure(){this.measureGroup&&=(this.scene.remove(this.measureGroup),this.disposeGroup(this.measureGroup),this.lineMaterials=this.lineMaterials.filter(e=>!e.userData.measure),null),this.measureLabel?.el.remove(),this.measureLabel=null,this.measure={points:[],distance:null},this.onMeasure?.(this.measure)}pickAt(e,t){if(!this.data)return null;let r=this.renderer.domElement.getBoundingClientRect(),i=new a((e-r.left)/r.width*2-1,-((t-r.top)/r.height)*2+1),o=new c;o.setFromCamera(i,this.camera);let s=Math.tan(n.degToRad(this.camera.fov)/2)/(r.height/2),l=o.ray.origin,u=o.ray.direction,d=fe(this.data.positions,this.data.count,[l.x,l.y,l.z],[u.x,u.y,u.z],s*8);if(d<0)return null;let f=this.data.positions;return[f[d*3],f[d*3+1],f[d*3+2]]}addMeasurePoint(e){let t=this.measure.points.length>=2?[e]:[...this.measure.points,e];this.measure.points.length>=2&&this.clearMeasure();let n=t[0],r=t[1],i=r?Math.hypot(r[0]-n[0],r[1]-n[1],r[2]-n[2]):null;this.measure={points:t,distance:i},this.measureGroup&&(this.scene.remove(this.measureGroup),this.disposeGroup(this.measureGroup),this.lineMaterials=this.lineMaterials.filter(e=>!e.userData.measure));let a=new p,o=t.map(e=>new b(...e));if(a.add(this.makeMarkers(o,o.map(()=>[1,1,1]),10)),r){let e=this.makeLine(new Float32Array([...n,...r]),16765286,2,1);e.material.userData.measure=!0,a.add(e),this.measureLabel?.el.remove(),this.measureLabel={el:this.makeLabel(`${i.toFixed(2)} m`,`vl-measure`),pos:o[0].clone().add(o[1]).multiplyScalar(.5)}}this.measureGroup=a,this.scene.add(a),this.onMeasure?.(this.measure)}onPointerDown=e=>{this.downAt=[e.clientX,e.clientY]};onPointerUp=e=>{if(!this.measuring||!this.downAt||e.button!==0)return;let t=Math.hypot(e.clientX-this.downAt[0],e.clientY-this.downAt[1]);if(this.downAt=null,t>4)return;let n=this.pickAt(e.clientX,e.clientY);if(n){this.addMeasurePoint(n);return}let r=this.renderer.domElement.getBoundingClientRect();this.measure={...this.measure,misses:(this.measure.misses??0)+1,missAt:[e.clientX-r.left,e.clientY-r.top]},this.onMeasure?.(this.measure)};capture(){this.renderer.setClearColor(Q,1),this.renderer.render(this.scene,this.camera);let e=this.renderer.domElement.toDataURL(`image/png`);return this.renderer.setClearColor(Q,0),e}makeLine(e,t,n,r){let i=new Z;i.setPositions(e);let o=this.renderer.getSize(new a),s=new P({color:t,linewidth:n,depthTest:!1,transparent:!0,opacity:r});s.resolution.set(o.x,o.y),this.lineMaterials.push(s);let c=new ie(i,s);return c.computeLineDistances(),c.renderOrder=10,c}makeMarkers(e,t,n){let r=new S;r.setAttribute(`position`,new v(new Float32Array(e.flatMap(e=>[e.x,e.y,e.z])),3)),r.setAttribute(`color`,new v(new Float32Array(t.flat()),3)),r.setAttribute(`size`,new v(new Float32Array(e.map(()=>n)),1));let i=new s(r,this.markerMaterial);return i.renderOrder=11,i.frustumCulled=!1,i}makeLabel(e,t){let n=document.createElement(`span`);return n.className=`viewer-label ${t}`,n.textContent=e,this.overlay.appendChild(n),n}disposeGroup(e){e.traverse(e=>{let t=e;t.geometry?.dispose();let n=t.material;n!==this.markerMaterial&&(Array.isArray(n)?n.forEach(e=>e.dispose()):n?.dispose())})}placeLabels(){let e=this.container.clientWidth,t=this.container.clientHeight,n=[...this.trajLabels,...this.measureLabel?[this.measureLabel]:[]],r=new b;for(let i of n){if(i.el.hidden)continue;r.copy(i.pos).project(this.camera);let n=r.z<1&&Math.abs(r.x)<=1.05&&Math.abs(r.y)<=1.05;i.el.style.visibility=n?`visible`:`hidden`,i.el.style.transform=`translate(${(r.x+1)/2*e}px, ${(1-r.y)/2*t}px)`}}resize(){let e=Math.max(1,this.container.clientWidth),t=Math.max(1,this.container.clientHeight);this.renderer.setSize(e,t,!1),this.camera.aspect=e/t,this.camera.updateProjectionMatrix();for(let n of this.lineMaterials)n.resolution.set(e,t)}loop=()=>{if(this.disposed)return;if(this.frame=requestAnimationFrame(this.loop),this.controls.update(),this.reveal&&this.points&&this.data){let e=Math.min(1,(performance.now()-this.reveal.t0)/this.reveal.ms);this.points.geometry.setDrawRange(0,Math.ceil(this.data.count*(1-(1-e)**3))),e>=1&&(this.reveal=null)}this.renderer.render(this.scene,this.camera),this.placeLabels(),this.fpsFrames++;let e=performance.now();e-this.fpsT0>=500&&(this.onStats({fps:this.fpsFrames*1e3/(e-this.fpsT0)}),this.fpsFrames=0,this.fpsT0=e)};handleContextLost=e=>{this.disposed||(e.preventDefault(),cancelAnimationFrame(this.frame),this.onContextLost())};dispose(){this.disposed=!0,cancelAnimationFrame(this.frame),this.resizeObserver.disconnect();let e=this.renderer.domElement;e.removeEventListener(`pointerdown`,this.onPointerDown),e.removeEventListener(`pointerup`,this.onPointerUp),e.removeEventListener(`webglcontextlost`,this.handleContextLost),this.onMeasure=null,this.onCameraChange(null),this.clearPoints(),this.setTrajectory(null),this.scene.traverse(e=>{e.geometry?.dispose()}),this.grid.material.dispose(),this.material.dispose(),this.markerMaterial.dispose(),this.controls.dispose(),this.renderer.dispose(),this.renderer.forceContextLoss(),e.remove(),this.overlay.remove()}};export{ee as i,ue as n,A as r,pe as t};