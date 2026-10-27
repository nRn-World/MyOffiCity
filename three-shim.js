// three r186 är bara ES-moduler: bygg ihop det gamla window.THREE som resten av koden använder.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

// shortcut: legacy-färgmatematik (som r128) så att scenen ser likadan ut; slå på när ljus/färger trimmats om.
THREE.ColorManagement.enabled = false;
window.THREE = { ...THREE, GLTFLoader, SkeletonUtils, BufferGeometryUtils };
