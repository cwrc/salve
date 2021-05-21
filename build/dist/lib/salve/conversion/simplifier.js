"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simplification support for trees produced by the parser module.
 *
 * This is an implementation in TypeScript of the XSLT pipeline we've been
 * using. The step numbers are equivalent to those in the XSLT pipeline with the
 * following exceptions:
 *
 * - Some steps are combined. The driving principles are:
 *
 *  + Steps are not combined if a later step is entirely dependent on the work
 *    of an earlier step.
 *
 *  + Steps are combined if they offer substantial performance benefits.
 *
 * Eventually the goal is to completely eliminate the XSLT pipeline. However,
 * during the transition phase we aim for relative parity with what the XSLT
 * pipeline does, in order to simplify testing. With a few small exceptions, we
 * can provide an input to a step and expect the same output in the XSLT and
 * TypeScript pipelines. So the TypeScript implementation may do things that
 * appears senseless. For instance, at some point all ``define`` elements are
 * renamed to make them unique, even those that do not have name clashes. We
 * replicate the XSLT process, where only renaming clashing defines would be
 * onerous. (It would also require the renaming operation to verify that new
 * names do not clash with those names that are not changed. If we change all
 * names, then this clash cannot occur.)
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
var step1_1 = require("./simplifier/step1");
Object.defineProperty(exports, "step1", { enumerable: true, get: function () { return step1_1.step1; } });
// Step 2-3 are covered by step 1.
var step4_1 = require("./simplifier/step4");
Object.defineProperty(exports, "step4", { enumerable: true, get: function () { return step4_1.step4; } });
// Step 5 is covered by step 4.
var step6_1 = require("./simplifier/step6");
Object.defineProperty(exports, "step6", { enumerable: true, get: function () { return step6_1.step6; } });
// Steps 7-8 are covered by step 6.
var step9_1 = require("./simplifier/step9");
Object.defineProperty(exports, "step9", { enumerable: true, get: function () { return step9_1.step9; } });
var step10_1 = require("./simplifier/step10");
Object.defineProperty(exports, "step10", { enumerable: true, get: function () { return step10_1.step10; } });
// Steps 11-13 are covered by step 10.
var step14_1 = require("./simplifier/step14");
Object.defineProperty(exports, "step14", { enumerable: true, get: function () { return step14_1.step14; } });
var step15_1 = require("./simplifier/step15");
Object.defineProperty(exports, "step15", { enumerable: true, get: function () { return step15_1.step15; } });
var step16_1 = require("./simplifier/step16");
Object.defineProperty(exports, "step16", { enumerable: true, get: function () { return step16_1.step16; } });
var step17_1 = require("./simplifier/step17");
Object.defineProperty(exports, "step17", { enumerable: true, get: function () { return step17_1.step17; } });
var step18_1 = require("./simplifier/step18");
Object.defineProperty(exports, "step18", { enumerable: true, get: function () { return step18_1.step18; } });
//# sourceMappingURL=simplifier.js.map